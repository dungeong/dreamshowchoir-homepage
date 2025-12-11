package kr.ulsan.dreamshowchoir.dungeong.config;

import kr.ulsan.dreamshowchoir.dungeong.config.auth.CustomOAuth2UserService;
import kr.ulsan.dreamshowchoir.dungeong.config.auth.HttpCookieOAuth2AuthorizationRequestRepository;
import kr.ulsan.dreamshowchoir.dungeong.config.auth.OAuth2LoginFailureHandler;
import kr.ulsan.dreamshowchoir.dungeong.config.auth.OAuth2LoginSuccessHandler;
import kr.ulsan.dreamshowchoir.dungeong.config.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;
    private final CustomOAuth2UserService customOAuth2UserService;

    @Bean // 이 메소드가 반환하는 SecurityFilterChain 객체를 Spring Bean으로 등록
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // ---------------- CSRF, CORS, Form 로그인, HTTP Basic 인증 비활성화

        // CSRF(Cross-Site Request Forgery) 보호 비활성화 (JWT 사용 시 불필요)
        http.csrf(AbstractHttpConfigurer::disable);

        // CORS 설정 활성화
        http.cors(cors -> cors.configurationSource(request -> {
            var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
            corsConfiguration.setAllowedOrigins(java.util.List.of("http://localhost:3000")); // 프론트엔드 주소 허용
            corsConfiguration.setAllowedMethods(java.util.List.of("GET", "POST", "PATCH", "DELETE", "OPTIONS"));
            corsConfiguration.setAllowedHeaders(java.util.List.of("*"));
            corsConfiguration.setAllowCredentials(true);
            return corsConfiguration;
        }));

        // 세션(Session) 관리 정책 설정: 세션을 사용하지 않음 (STATELESS)
        // (JWT 기반 인증이므로 서버가 세션 상태를 저장할 필요 없음)
        http.sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );



        // --------------- API 엔드포인트별 접근 권한 설정

        http.authorizeHttpRequests(auth -> auth
                // (공개 허용) 루트(/), OAuth2 로그인 과정(/oauth2/**) 등은 모두 허용
                .requestMatchers(
                        "/",
                        "/oauth2/**",
                        "/login/**",
                        "/error",
                        "/swagger-ui.html", // Swagger UI
                        "/swagger-ui/**",
                        "/v3/api-docs/**",  // Springdoc API 문서
                        "/api-docs/**",
                        "/api/activity-materials/**",   // 활동 자료 조회
                        "/api/auth/refresh"
                ).permitAll()
                .requestMatchers(HttpMethod.GET,        // 읽기
                        "/api/banners",             // 배너
                        "/api/info/**",             // 단원 소개
                        "/api/activity-materials/**",   // 활동자료
                        "/api/gallery/**",          // 갤러리
                        "/api/faq/**",              // FAQ
                        "/api/history",             // 연혁
                        "/api/content/**",           // 통합 콘텐츠
                        "/api/donations/donors"
                ).permitAll()
                .requestMatchers(HttpMethod.POST, "/api/inquiry").permitAll()   // 문의 생성

                // "GUEST"만 (최초 가입)
                .requestMatchers("/api/users/sign-up").hasRole("GUEST")

                // "GUEST"만 빼고 (개인 정보 수정)
                .requestMatchers(HttpMethod.PATCH, "/api/users/me").hasAnyRole("USER", "MEMBER", "ADMIN")

                // "USER"만 (단원 가입 신청)
                .requestMatchers("/api/join").hasRole("USER")

                // 'MEMBER' 권한 필요
                .requestMatchers(
                        "/api/posts/**",    // 게시글 및 댓글
                        "/api/member/**",   // 멤버 하위
                        "/api/sheets/**"    // 악보 및 자료실
                ).hasAnyRole("MEMBER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/notices/**").hasAnyRole("MEMBER", "ADMIN")   // 공지사항 읽기

                // (인증 필요) /api/auth/me (내 정보 조회)는 '인증'만 되면 허용
                .requestMatchers(
                        "/api/auth/me/**",
                        "/api/donations/**"
                ).authenticated()

                // (관리자 권한) /api/admin/** 은 'ADMIN' 역할(Role)이 있어야만 허용
                .requestMatchers("/api/admin/**").hasRole("ADMIN")


                // 그 외 모든 요청은 '인증'된 사용자만 접근 가능
                .anyRequest().authenticated()
        );


        // ------------- OAuth2 로그인 설정

        http.oauth2Login(oauth2 -> oauth2

                // 인증 요청 저장소를 세션 대신 쿠키로 설정
                .authorizationEndpoint(auth -> auth
                        .authorizationRequestRepository(httpCookieOAuth2AuthorizationRequestRepository))
                .successHandler(oAuth2LoginSuccessHandler)      // 로그인 성공 시 JWT 발급
                .failureHandler(oAuth2LoginFailureHandler)      // 로그인 실패 시 에러 처리
                .userInfoEndpoint(userInfo -> userInfo
                        .userService(customOAuth2UserService)   // 커스텀 유저 서비스 등록
                )
        );

        // 스프링 시큐리티 기본 로그아웃 비활성화
        http.logout(AbstractHttpConfigurer::disable);

        // --------------- JWT 필터 등록
        // Spring Security의 기본 인증 필터보다 직접 만든 JWT 필터를 먼저 실행하도록 순서를 지정
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}