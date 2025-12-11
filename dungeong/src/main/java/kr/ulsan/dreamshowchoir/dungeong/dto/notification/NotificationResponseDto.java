package kr.ulsan.dreamshowchoir.dungeong.dto.notification;

import kr.ulsan.dreamshowchoir.dungeong.domain.notification.Notification;
import kr.ulsan.dreamshowchoir.dungeong.domain.notification.NotificationType;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class NotificationResponseDto {
    private final Long notificationId;
    private final NotificationType type;
    private final String message;
    private final Boolean isRead;
    private final LocalDateTime createdAt;

    public NotificationResponseDto(Notification notification) {
        this.notificationId = notification.getNotificationId();
        this.type = notification.getType();
        this.message = notification.getMessage();
        this.isRead = notification.getIsRead();
        this.createdAt = notification.getCreatedAt();
    }
}