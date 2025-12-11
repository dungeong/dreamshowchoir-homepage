package kr.ulsan.dreamshowchoir.dungeong.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.ulsan.dreamshowchoir.dungeong.dto.notification.NotificationResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Notification (알림)", description = "알림 관련 API")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 나의 알림 목록 조회 API
     * (GET /api/notifications)
     */
    @Operation(summary = "나의 알림 목록 조회", description = "로그인한 사용자의 모든 알림 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<NotificationResponseDto>> getMyNotifications(
            @AuthenticationPrincipal Long userId
    ) {
        return ResponseEntity.ok(notificationService.getMyNotifications(userId));
    }

    /**
     * 알림 읽음 처리 API
     * (PATCH /api/notifications/{notificationId}/read)
     */
    @Operation(summary = "알림 읽음 처리", description = "특정 알림을 읽음 상태로 변경합니다.")
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> readNotification(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal Long userId
    ) {
        notificationService.readNotification(notificationId, userId);
        return ResponseEntity.ok().build();
    }
}