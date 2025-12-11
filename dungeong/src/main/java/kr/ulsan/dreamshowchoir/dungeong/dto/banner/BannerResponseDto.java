package kr.ulsan.dreamshowchoir.dungeong.dto.banner;

import kr.ulsan.dreamshowchoir.dungeong.domain.banner.Banner;
import lombok.Getter;

@Getter
public class BannerResponseDto {
    private final Long bannerId;
    private final String title;
    private final String description;
    private final String imageUrl;
    private final Integer orderIndex;
    private final Boolean isActive;

    public BannerResponseDto(Banner banner) {
        this.bannerId = banner.getBannerId();
        this.title = banner.getTitle();
        this.description = banner.getDescription();
        this.imageUrl = banner.getImageKey();
        this.orderIndex = banner.getOrderIndex();
        this.isActive = banner.getIsActive();
    }
}