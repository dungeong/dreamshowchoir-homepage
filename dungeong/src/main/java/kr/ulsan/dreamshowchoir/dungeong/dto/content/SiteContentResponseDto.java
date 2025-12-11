package kr.ulsan.dreamshowchoir.dungeong.dto.content;

import kr.ulsan.dreamshowchoir.dungeong.domain.content.SiteContent;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class SiteContentResponseDto {

    private final String contentKey;
    private final String content;
    private final LocalDateTime updatedAt;

    /**
     * Entity를 DTO로 변환하는 생성자
     */
    public SiteContentResponseDto(SiteContent siteContent) {
        this.contentKey = siteContent.getContentKey();
        this.content = siteContent.getContent();
        this.updatedAt = siteContent.getUpdatedAt();
    }
}