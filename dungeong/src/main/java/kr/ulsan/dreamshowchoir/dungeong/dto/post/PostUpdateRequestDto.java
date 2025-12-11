package kr.ulsan.dreamshowchoir.dungeong.dto.post;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostUpdateRequestDto {

    @NotBlank(message = "제목을 입력해주세요.")
    private String title;

    @NotBlank(message = "내용을 입력해주세요.")
    private String content;

    // 삭제할 기존 이미지들의 ID 리스트 (없으면 null 또는 빈 리스트)
    private List<Long> deleteImageIds;
}