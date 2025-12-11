import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

// 1. Axios 인스턴스 생성
const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 2. 재발급 진행 중인지 체크하는 변수 & 대기열
let isRefreshing = false;
let failedQueue: any[] = [];

// 대기열에 있는 요청들을 처리하는 함수
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// 3. 요청 인터셉터 (Request Interceptor)
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('[Axios Request] Error in request setup:', error);
        return Promise.reject(error);
    }
);

// 4. 응답 인터셉터 (Response Interceptor)
// Interceptor 1: HTML 응답 감지 및 에러 변환
instance.interceptors.response.use(
    (response) => {
        // 백엔드가 API 요청에 대해 JSON이 아닌 HTML(로그인 페이지)을 반환했다면 200 OK라도 토큰 만료로 간주
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('text/html') && response.config.url?.startsWith('/api')) {

            const error = new AxiosError(
                'Unauthorized (Redirected to Login)',
                'UNAUTHORIZED_REDIRECT',
                response.config,
                response.request,
                {
                    status: 401,
                    statusText: 'Unauthorized',
                    headers: response.headers,
                    config: response.config,
                    data: response.data
                }
            );
            return Promise.reject(error);
        }
        return response;
    },
    (error) => Promise.reject(error)
);

// Interceptor 2: 401 에러 처리 및 토큰 재발급
instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (!originalRequest) {
            return Promise.reject(error);
        }

        // 401 Unauthorized 에러가 떴고, 아직 재시도하지 않은 요청이라면
        if (error.response?.status === 401 && !originalRequest._retry) {

            // A. 이미 다른 요청이 토큰 재발급을 진행 중이라면? -> 대기열(Queue)에 등록
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(instance(originalRequest));
                        },
                        reject: (err: any) => {
                            reject(err);
                        },
                    });
                });
            }

            // B. 내가 총대 메고 재발급 시작
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 토큰 재발급 요청
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

                const { data } = await axios.post(
                    `${apiUrl}/api/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                // Refresh response validation: Check if data is HTML or missing token
                if (typeof data === 'string' && data.includes('<!DOCTYPE')) {
                    throw new Error('Refresh token expired (Returned HTML login page)');
                }
                if (!data || !data.accessToken) {
                    throw new Error('Refresh failed (No access token returned)');
                }

                const newAccessToken = data.accessToken;

                // 1. 스토어에 새 토큰 저장
                useAuthStore.getState().setAccessToken(newAccessToken);

                // 2. Axios 기본 헤더 변경
                instance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // 3. 대기 중이던 요청들에게 새 토큰 나눠주고 출발 신호
                processQueue(null, newAccessToken);

                // 4. 내 요청 재시도
                return instance(originalRequest);

            } catch (refreshError) {
                // C. 재발급 실패 (리프레시 토큰도 만료됨) -> 로그아웃 처리
                processQueue(refreshError, null);

                // 스토어 비우기
                useAuthStore.getState().logout();

                // 알림 및 강제 이동 (Avoid infinite loop if already on login page)
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            } finally {
                // 상태 초기화
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default instance;
