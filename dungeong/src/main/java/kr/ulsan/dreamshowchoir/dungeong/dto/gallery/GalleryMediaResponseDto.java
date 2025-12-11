package kr.ulsan.dreamshowchoir.dungeong.dto.gallery;

import kr.ulsan.dreamshowchoir.dungeong.domain.common.MediaType;
import kr.ulsan.dreamshowchoir.dungeong.domain.gallery.GalleryMedia;
import lombok.Getter;

@Getter
public class GalleryMediaResponseDto {

    private final Long mediaId;
    private final String fileKey; // S3 URL
    private final MediaType mediaType; // IMAGE 또는 VIDEO

    public GalleryMediaResponseDto(GalleryMedia media) {
        this.mediaId = media.getMediaId();
        this.fileKey = media.getFileKey();
        this.mediaType = media.getMediaType();
    }
}