package kr.ulsan.dreamshowchoir.dungeong.domain.notification.repository;

import kr.ulsan.dreamshowchoir.dungeong.domain.notification.Notification;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 내 알림 목록 조회 (최신순)
    List<Notification> findAllByUserOrderByCreatedAtDesc(User user);

    // 안 읽은 알림 개수 (뱃지 표시용)
    long countByUserAndIsReadFalse(User user);
}