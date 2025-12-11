package kr.ulsan.dreamshowchoir.dungeong.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import kr.ulsan.dreamshowchoir.dungeong.dto.auth.JwtTokenDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.user.UserResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Tag(name = "Auth (인증)", description = "사용자 인증 및 정보 관련 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 현재 로그인된 사용자의 정보를 반환하는 API
     * (GET /api/auth/me)
     *
     * @param userId @AuthenticationPrincipal을 통해 Spring Security가 주입해주는 현재 사용자의 ID
     * @return UserResponseDto
     */
    @Operation(summary = "내 정보 조회", description = "현재 로그인된 사용자의 정보를 조회합니다.")
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMyInfo(@AuthenticationPrincipal Long userId) {

        // userId가 null이면 로그인되지 않은 상태이므로, 401 Unauthorized 응답
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        // AuthService를 호출하여 사용자 정보를 DTO로 받아옴
        UserResponseDto userInfo = authService.getUserInfo(userId);

        // 200 OK 상태와 함께 사용자 정보를 응답
        return ResponseEntity.ok(userInfo);
    }

    /**
     * Access Token 갱신 API
     * (POST /api/auth/refresh)
     */
    @Operation(summary = "Access Token 갱신", description = "HttpOnly 쿠키에 저장된 Refresh Token을 사용하여 새로운 Access Token을 발급받습니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "토큰 갱신 성공", content = @Content(schema = @Schema(implementation = JwtTokenDto.class))),
            @ApiResponse(responseCode = "401", description = "Refresh Token이 없거나 유효하지 않음 (만료 포함)", content = @Content),
            @ApiResponse(responseCode = "404", description = "해당 Refresh Token을 가진 유저를 찾을 수 없음", content = @Content)
    })
    @PostMapping("/refresh")
    public ResponseEntity<JwtTokenDto> refreshAccessToken(
            @CookieValue(value = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        log.info("refreshAccessToken() 실행됨");
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 쿠키가 없으면 401
        }
        JwtTokenDto newToken = authService.refreshAccessToken(refreshToken, response);
        return ResponseEntity.ok(newToken);
    }

    /**
     * 로그아웃 API
     * (POST /api/auth/logout)
     */
    @Operation(summary = "로그아웃", description = "서버 데이터베이스에서 Refresh Token을 삭제하고, 클라이언트의 Refresh Token 쿠키를 만료시킵니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "로그아웃 성공 (내용 없음)", content = @Content)
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(value = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        authService.logout(refreshToken, response);
        return ResponseEntity.noContent().build();
    }
}