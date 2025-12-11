package kr.ulsan.dreamshowchoir.dungeong.dto.notice;

import kr.ulsan.dreamshowchoir.dungeong.domain.notice.NoticeImage;
import lombok.Getter;

@Getter
public class NoticeImageDto {
    private final Long imageId;
    private final String imageUrl;

    public NoticeImageDto(NoticeImage image) {
        this.imageId = image.getImageId();
        this.imageUrl = image.getImageKey();
    }
}
