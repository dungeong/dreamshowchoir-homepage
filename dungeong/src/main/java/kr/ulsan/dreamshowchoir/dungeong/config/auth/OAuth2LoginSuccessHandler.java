package kr.ulsan.dreamshowchoir.dungeong.config.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.ulsan.dreamshowchoir.dungeong.dto.auth.JwtTokenDto;
import kr.ulsan.dreamshowchoir.dungeong.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;


    // 프론트엔드의 OAuth 콜백 주소
    @Value("${frontend.redirect-url}")
    private String FRONTEND_REDIRECT_URL;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {

        log.info("OAuth2 Login 성공! 토큰 발급 시작");

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        log.info("로그인한 유저 Principal 정보: ID={}, Email={}", userPrincipal.getUserId(), userPrincipal.getUsername());

        // AuthService를 통해 토큰 발급 (Access Token 생성, Refresh Token 쿠키 설정 완료)
        // issueTokens 내부에서 UserPrincipal 정보를 바탕으로 토큰을 생성
        JwtTokenDto tokenDto = authService.issueTokens(authentication, response);

        log.info("토큰 발급 완료. Access Token: {}, Refresh Token 쿠키 설정됨", tokenDto.getAccessToken());

        // 먼저 설정된 URL 문자열을 안전하게 URI 객체로 변환
        URI baseUri = URI.create(FRONTEND_REDIRECT_URL);

        // UriComponentsBuilder.newInstance()를 사용하여 명시적으로 조립
        String targetUrl = UriComponentsBuilder.newInstance()
                .scheme(baseUri.getScheme()) // 예: http 또는 https
                .host(baseUri.getHost())     // 예: localhost 또는 dreamshowchoir.kr
                .port(baseUri.getPort())     // 예: 3000 (포트가 없으면 -1이 반환되는데, 이 경우 생략됨)
                .path(baseUri.getPath())     // 예: /oauth/callback
                .queryParam("token", tokenDto.getAccessToken()) // 토큰 파라미터 추가
                .build()
                .toUriString();

        // 리다이렉트 URL 보안 검증 (Open Redirect 방지)
        if (!isAuthorizedRedirectUri(targetUrl)) {
            log.error("보안 위배: 허용되지 않은 리다이렉트 URI 입니다. Target: {}", targetUrl);
            throw new SecurityException("허용되지 않은 리다이렉트 URI 입니다.");
        }

        // 세션 기반이 아니므로, 기존 인증 관련 세션 데이터를 삭제
        clearAuthenticationAttributes(request);

        // 지정된 URL로 리디렉션
        log.info("프론트엔드로 리디렉션: {}", targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    // 헬퍼 메소드: 생성된 URL이 설정된 프론트엔드 주소로 시작하는지 검증
    private boolean isAuthorizedRedirectUri(String uri) {
        URI clientRedirectUri = URI.create(uri);
        URI authorizedUri = URI.create(FRONTEND_REDIRECT_URL);

        // 호스트(도메인)와 포트가 일치하는지 확인
        // 예: localhost == localhost, 3000 == 3000
        return authorizedUri.getHost().equalsIgnoreCase(clientRedirectUri.getHost())
                && authorizedUri.getPort() == clientRedirectUri.getPort();
    }
}