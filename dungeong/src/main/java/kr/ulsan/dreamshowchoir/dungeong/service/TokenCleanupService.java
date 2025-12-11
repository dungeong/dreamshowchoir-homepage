package kr.ulsan.dreamshowchoir.dungeong.service;

import kr.ulsan.dreamshowchoir.dungeong.domain.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenCleanupService {

    private final RefreshTokenRepository refreshTokenRepository;

    // 매일 새벽 4시 0분 0초에 실행
    @Scheduled(cron = "0 0 4 * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        log.info("=== 만료된 Refresh Token 청소 시작 : {} ===", now);

        // 만료 시간이 현재 시간보다 이전인 토큰 싹 삭제
        refreshTokenRepository.deleteByExpiresAtBefore(now);

        log.info("=== 청소 완료 ===");
    }
}