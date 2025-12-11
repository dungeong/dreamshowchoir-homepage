package kr.ulsan.dreamshowchoir.dungeong.domain.notification.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.notification.Notification;
import kr.ulsan.dreamshowchoir.dungeong.domain.notification.NotificationType;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(JpaAuditingConfig.class)
class NotificationRepositoryTest {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    private User savedTestUser;

    @BeforeEach
    void setUp() {
        User testUser = User.builder()
                .name("알림받는유저")
                .email("noti@example.com")
                .oauthProvider("google")
                .oauthId("google_noti_123")
                .role(Role.USER)
                .build();
        savedTestUser = userRepository.saveAndFlush(testUser);
    }

    @Test
    @DisplayName("새로운 Notification을 저장하고 ID로 조회하면 성공")
    void saveAndFindNotificationTest() {
        // given
        Notification newNotification = Notification.builder()
                .user(savedTestUser)
                .type(NotificationType.NEW_COMMENT) // 기존 Enum 사용
                .message("새로운 댓글이 달렸습니다.")
                .build();

        // when
        Notification savedNotification = notificationRepository.save(newNotification);

        // then
        Notification foundNotification = notificationRepository.findById(savedNotification.getNotificationId()).orElseThrow();

        assertThat(foundNotification.getNotificationId()).isEqualTo(savedNotification.getNotificationId());
        assertThat(foundNotification.getMessage()).isEqualTo("새로운 댓글이 달렸습니다.");
        assertThat(foundNotification.getType()).isEqualTo(NotificationType.NEW_COMMENT);
        assertThat(foundNotification.getIsRead()).isFalse();
        assertThat(foundNotification.getUser().getName()).isEqualTo("알림받는유저");
        assertThat(foundNotification.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("특정 유저의 알림 목록(전체)을 최신순으로 조회함")
    void findAllByUserOrderByCreatedAtDescTest() {
        // given
        // 1. (과거) 문의 답변
        notificationRepository.saveAndFlush(Notification.builder()
                .user(savedTestUser)
                .type(NotificationType.INQUIRY_REPLY) // 추가한 Enum 사용
                .message("문의 답변이 달렸습니다.")
                .build());

        // 2. (중간) 가입 승인 (읽음 처리)
        Notification readNotification = Notification.builder()
                .user(savedTestUser)
                .type(NotificationType.JOIN_APPROVED) // 기존 Enum 사용
                .message("가입이 승인되었습니다.")
                .build();
        readNotification = notificationRepository.save(readNotification);
        readNotification.markAsRead();
        notificationRepository.saveAndFlush(readNotification);

        // 3. (최신) 새 공지사항
        Notification latestNotification = notificationRepository.saveAndFlush(Notification.builder()
                .user(savedTestUser)
                .type(NotificationType.NEW_NOTICE) // 기존 Enum 사용
                .message("최신 공지사항")
                .build());

        // when
        List<Notification> notifications = notificationRepository.findAllByUserOrderByCreatedAtDesc(savedTestUser);

        // then
        assertThat(notifications).hasSize(3);
        assertThat(notifications.get(0).getNotificationId()).isEqualTo(latestNotification.getNotificationId());
        assertThat(notifications.get(0).getType()).isEqualTo(NotificationType.NEW_NOTICE);
    }

    @Test
    @DisplayName("알림을 '읽음' 상태로 변경")
    void markAsReadTest() {
        // given
        Notification notification = notificationRepository.save(Notification.builder()
                .user(savedTestUser)
                .type(NotificationType.NEW_NOTICE)
                .message("이 알림을 읽을 겁니다.")
                .build());

        assertThat(notification.getIsRead()).isFalse();

        // when
        notification.markAsRead();
        notificationRepository.saveAndFlush(notification);

        // then
        Notification foundNotification = notificationRepository.findById(notification.getNotificationId()).orElseThrow();
        assertThat(foundNotification.getIsRead()).isTrue();
    }

    @Test
    @DisplayName("안 읽은 알림 개수 카운트 (뱃지용)")
    void countUnreadTest() {
        // given: 안 읽은 것 2개, 읽은 것 1개 저장
        notificationRepository.save(Notification.builder().user(savedTestUser).type(NotificationType.NEW_NOTICE).message("1").build());
        notificationRepository.save(Notification.builder().user(savedTestUser).type(NotificationType.NEW_COMMENT).message("2").build());

        Notification readNoti = Notification.builder().user(savedTestUser).type(NotificationType.JOIN_REJECTED).message("3").build();
        readNoti = notificationRepository.save(readNoti);
        readNoti.markAsRead();
        notificationRepository.saveAndFlush(readNoti);

        // when
        long count = notificationRepository.countByUserAndIsReadFalse(savedTestUser);

        // then
        assertThat(count).isEqualTo(2);
    }
}