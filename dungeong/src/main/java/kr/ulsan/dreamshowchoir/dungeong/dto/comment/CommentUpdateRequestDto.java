package kr.ulsan.dreamshowchoir.dungeong.dto.comment;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CommentUpdateRequestDto {

    @NotBlank(message = "댓글 내용을 입력해주세요.")
    private String content;
}