package kr.ulsan.dreamshowchoir.dungeong.dto.gallery;

import kr.ulsan.dreamshowchoir.dungeong.domain.gallery.Gallery;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class GalleryListResponseDto {

    private final Long galleryId;
    private final String type;
    private final String title;
    private final String authorName;
    private final LocalDateTime createdAt;
    private final String thumbnailUrl;

    public GalleryListResponseDto(Gallery gallery) {
        this.galleryId = gallery.getGalleryId();
        this.type = gallery.getType();
        this.title = gallery.getTitle();
        this.authorName = gallery.getUser().getName();
        this.createdAt = gallery.getCreatedAt();

        // 썸네일 로직
        if (gallery.getGalleryMedia() != null && !gallery.getGalleryMedia().isEmpty()) {
            // Gallery 엔티티에 @OneToMany로 연결된 리스트의 0번 인덱스 가져오기
            this.thumbnailUrl = gallery.getGalleryMedia().get(0).getFileKey();
        } else {
            // 미디어가 없는 경우 null (프론트에서 기본 이미지 처리)
            this.thumbnailUrl = null;
        }
    }
}