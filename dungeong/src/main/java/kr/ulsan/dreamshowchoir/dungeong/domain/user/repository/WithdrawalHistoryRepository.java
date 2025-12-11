package kr.ulsan.dreamshowchoir.dungeong.domain.user.repository;

import kr.ulsan.dreamshowchoir.dungeong.domain.user.WithdrawalHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface WithdrawalHistoryRepository extends JpaRepository<WithdrawalHistory, Long> {
    Optional<WithdrawalHistory> findByOauthProviderAndOauthId(String provider, String oauthId);

    void deleteByWithdrawnAtBefore(LocalDateTime time);
}
