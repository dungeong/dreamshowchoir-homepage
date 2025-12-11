package kr.ulsan.dreamshowchoir.dungeong.dto.gallery;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GalleryUpdateRequestDto {

    @NotNull(message = "갤러리 타입을 선택해주세요.")
    private String type;

    @NotBlank(message = "제목을 입력해주세요.")
    private String title;
    private String description;

    // 삭제할 미디어 ID 리스트
    private List<Long> deleteMediaIds;
}