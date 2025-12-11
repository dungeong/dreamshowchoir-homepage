package kr.ulsan.dreamshowchoir.dungeong.dto.banner;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BannerUpdateRequestDto {

    @NotBlank(message = "제목을 입력해주세요.")
    private String title;

    private String description;

    @NotNull(message = "노출 순서를 입력해주세요.")
    private Integer orderIndex;

    @NotNull(message = "활성화 여부를 선택해주세요.")
    private Boolean isActive;
}