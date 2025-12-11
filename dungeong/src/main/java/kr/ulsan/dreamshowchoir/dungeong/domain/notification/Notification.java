package kr.ulsan.dreamshowchoir.dungeong.domain.notification;

import jakarta.persistence.*;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "\"Notification\"")
@EntityListeners(AuditingEntityListener.class)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NOTIFICATION_ID")
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;


    @Enumerated(EnumType.STRING)
    @Column(name = "TYPE", nullable = false, length = 50)
    private NotificationType type;

    @Column(name = "MESSAGE", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "IS_READ", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @CreatedDate
    @Column(name = "CREATED_AT", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    // 읽음 처리
    public void markAsRead() {
        this.isRead = true;
    }
}