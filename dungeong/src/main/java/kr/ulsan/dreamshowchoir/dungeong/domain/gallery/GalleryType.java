package kr.ulsan.dreamshowchoir.dungeong.domain.gallery;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum GalleryType {
    REGULAR("정기공연"),
    IRREGULAR("비정기공연"),
    EVENT("행사");

    private final String description;
}
