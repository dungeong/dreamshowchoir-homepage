package kr.ulsan.dreamshowchoir.dungeong.service;

import jakarta.persistence.EntityNotFoundException;
import kr.ulsan.dreamshowchoir.dungeong.domain.notification.Notification;
import kr.ulsan.dreamshowchoir.dungeong.domain.notification.NotificationType;
import kr.ulsan.dreamshowchoir.dungeong.domain.notification.repository.NotificationRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.UserRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.notification.NotificationResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * 내 알림 목록 조회
     */
    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getMyNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        return notificationRepository.findAllByUserOrderByCreatedAtDesc(user).stream()
                .map(NotificationResponseDto::new)
                .collect(Collectors.toList());
    }

    /**
     * 알림 읽음 처리
     */
    public void readNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("알림을 찾을 수 없습니다: " + notificationId));

        if (!notification.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("해당 알림에 대한 권한이 없습니다.");
        }

        notification.markAsRead();
    }

    /**
     * (내부용) 알림 생성
     * - 다른 서비스(JoinService, InquiryService 등)에서 호출
     */
    public void createNotification(User user, NotificationType type, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }
}