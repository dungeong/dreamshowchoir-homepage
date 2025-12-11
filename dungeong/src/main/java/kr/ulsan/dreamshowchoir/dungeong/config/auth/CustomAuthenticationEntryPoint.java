package kr.ulsan.dreamshowchoir.dungeong.config.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        log.warn("인증되지 않은 사용자의 접근: {}", request.getRequestURI(), authException);

        // 응답 상태를 401 Unauthorized로 설정
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        // 응답 컨텐츠 타입을 JSON으로 설정
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        // 응답 문자 인코딩 설정
        response.setCharacterEncoding("UTF-8");

        // 프론트엔드에게 보낼 JSON 에러 메시지 생성
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        errorDetails.put("error", "Unauthorized");
        errorDetails.put("message", "인증이 필요합니다. (토큰이 없거나 유효하지 않습니다)");
        errorDetails.put("path", request.getRequestURI());

        // JSON을 응답 Body에 직접 작성
        response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
    }
}