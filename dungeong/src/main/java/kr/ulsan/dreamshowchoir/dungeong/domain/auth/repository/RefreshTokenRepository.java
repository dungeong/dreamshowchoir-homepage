package kr.ulsan.dreamshowchoir.dungeong.domain.auth.repository;

import kr.ulsan.dreamshowchoir.dungeong.domain.auth.RefreshToken;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    // 토큰 값으로 조회
    Optional<RefreshToken> findByTokenValue(String tokenValue);

    // 특정 유저의 토큰 삭제 (로그아웃 시)
    void deleteByUser(User user);

    // 특정 유저의 토큰이 존재하는지 확인
    boolean existsByUser(User user);

    // 현재 시간보다 만료일(expiresAt)이 과거인 토큰들을 일괄 삭제
    void deleteByExpiresAtBefore(LocalDateTime now);
}