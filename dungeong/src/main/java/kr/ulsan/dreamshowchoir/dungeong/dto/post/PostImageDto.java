package kr.ulsan.dreamshowchoir.dungeong.dto.post;

import kr.ulsan.dreamshowchoir.dungeong.domain.post.PostImage;
import lombok.Getter;

@Getter
public class PostImageDto {
    private final Long imageId;
    private final String imageUrl;

    public PostImageDto(PostImage image) {
        this.imageId = image.getImageId();
        this.imageUrl = image.getImageKey();
    }
}