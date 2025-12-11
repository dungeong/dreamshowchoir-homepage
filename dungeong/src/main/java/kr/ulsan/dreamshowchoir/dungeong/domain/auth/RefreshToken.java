package kr.ulsan.dreamshowchoir.dungeong.domain.auth;

import jakarta.persistence.*;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "\"RefreshTokens\"")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TOKEN_ID")
    private Long tokenId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "TOKEN_VALUE", nullable = false, columnDefinition = "TEXT")
    private String tokenValue;

    @Column(name = "EXPIRES_AT", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public RefreshToken(User user, String tokenValue, LocalDateTime expiresAt) {
        this.user = user;
        this.tokenValue = tokenValue;
        this.expiresAt = expiresAt;
        this.createdAt = LocalDateTime.now();
    }

    // 토큰 값 업데이트 메소드 (Refresh Token Rotation 시 사용)
    public void updateToken(String newTokenValue, LocalDateTime newExpiresAt) {
        this.tokenValue = newTokenValue;
        this.expiresAt = newExpiresAt;
        this.createdAt = LocalDateTime.now(); // 갱신 시간 업데이트
    }
}