package kr.ulsan.dreamshowchoir.dungeong.domain.notification;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum NotificationType {
    NEW_COMMENT("NEW_COMMENT", "새 댓글 알림"),
    JOIN_APPROVED("JOIN_APPROVED", "단원 가입 승인"),
    JOIN_REJECTED("JOIN_REJECTED", "단원 가입 거절"),
    NEW_NOTICE("NEW_NOTICE", "새 공지사항"),
    INQUIRY_REPLY("INQUIRY_REPLY", "문의 답변 알림"),
    DONATION_APPROVED("DONATION_APPROVED", "후원 처리 완료"),
    DONATION_REJECTED("DONATION_REJECTED", "후원 처리 실패");

    private final String key;
    private final String title;
}
