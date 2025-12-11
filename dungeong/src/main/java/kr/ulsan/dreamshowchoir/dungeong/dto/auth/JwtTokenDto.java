package kr.ulsan.dreamshowchoir.dungeong.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtTokenDto {

    private String grantType;   // 토큰 타입 (예 : Bearer)
    private String accessToken; // 접근 토큰 (짧은 수명)
    private String refreshToken; // 갱신 토큰 (긴 수명) - (선택 사항: 쿠키로만 전달할 경우 제외 가능)
    private Long accessTokenExpiresIn; // 액세스 토큰 만료 시간 (밀리초 단위)
}