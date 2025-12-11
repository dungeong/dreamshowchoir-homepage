package kr.ulsan.dreamshowchoir.dungeong.config.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 실제 필터링 로직: 요청마다 JWT 토큰을 검사함
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Request Header에서 토큰을 꺼냄
        String jwt = resolveToken(request);

        // 토큰 유효성 검증
        // (StringUtils.hasText: null, "", " "가 아닌지 확인)
        try {
            if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {

                // 토큰이 유효하면, 토큰에서 Authentication(인증 정보) 객체를 가져옴
                Authentication authentication = jwtTokenProvider.getAuthentication(jwt);

                // SecurityContextHolder에 인증 정보를 저장
                // (이 코드가 실행되면, Spring Security는 이 요청을 '인증된 사용자'로 간주)
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            request.setAttribute("exception", e);
        }

        // 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }

    /**
     * Request Header에서 "Bearer " 접두사를 제거하고 토큰 값만 추출
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(7); // "Bearer " (7글자) 이후의 토큰 반환
        }
        return null;
    }
}