package kr.ulsan.dreamshowchoir.dungeong.dto.notice;

import kr.ulsan.dreamshowchoir.dungeong.domain.notice.Notice;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class NoticeResponseDto {

    private final Long noticeId;
    private final String title;
    private final String content;
    private final String authorName;
    private final Long authorId;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final List<NoticeImageDto> images;

    /**
     * Entity를 DTO로 변환하는 생성자
     */
    public NoticeResponseDto(Notice notice) {
        this.noticeId = notice.getNoticeId();
        this.title = notice.getTitle();
        this.content = notice.getContent();
        // Null 체크
        if (notice.getUser() != null) {
            this.authorName = notice.getUser().getName();
            this.authorId = notice.getUser().getUserId();
        } else {
            this.authorName = "알 수 없음";
            this.authorId = null;
        }
        this.createdAt = notice.getCreatedAt();
        this.updatedAt = notice.getUpdatedAt();

        // Entity -> URL 리스트 변환
        this.images = notice.getNoticeImages().stream()
                .map(NoticeImageDto::new)
                .collect(Collectors.toList());
    }
}