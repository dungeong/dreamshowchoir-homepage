package kr.ulsan.dreamshowchoir.dungeong.dto.notice;

import kr.ulsan.dreamshowchoir.dungeong.domain.notice.Notice;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 공지사항 '목록' 조회를 위한 DTO (본문 제외)
 */
@Getter
public class NoticeListResponseDto {

    private final Long noticeId;
    private final String title;
    private final String authorName;
    private final LocalDateTime createdAt;

    /**
     * Notice 엔티티를 NoticeListResponseDto로 변환
     */
    public NoticeListResponseDto(Notice notice) {
        this.noticeId = notice.getNoticeId();
        this.title = notice.getTitle();
        this.authorName = notice.getUser().getName();
        this.createdAt = notice.getCreatedAt();
    }
}