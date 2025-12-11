package kr.ulsan.dreamshowchoir.dungeong.config.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
public class OAuth2LoginFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${frontend.error-url}")
    private String frontendErrorUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException{

        log.warn("OAuth2 로그인 실패: {}", exception.getMessage());

        // 에러 메시지 추출 (한글 포함 가능)
        String errorMessage = exception.getMessage();

        // URL 생성 및 인코딩
        // UriComponentsBuilder.newInstance()를 사용하여 명시적으로 조립
        String targetUrl = UriComponentsBuilder.fromUriString(frontendErrorUrl)
                .queryParam("error", errorMessage)
                .encode(StandardCharsets.UTF_8) // 한글이 깨지지 않게 UTF-8로 인코딩
                .build()
                .toUriString();

        // 리다이렉트
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}