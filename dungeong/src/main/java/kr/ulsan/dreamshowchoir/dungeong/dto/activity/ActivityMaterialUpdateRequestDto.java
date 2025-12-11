package kr.ulsan.dreamshowchoir.dungeong.dto.activity;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ActivityMaterialUpdateRequestDto {

    @NotBlank(message = "제목을 입력해주세요.")
    private String title;

    private String description;
}