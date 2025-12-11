package kr.ulsan.dreamshowchoir.dungeong.dto.faq;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FaqUpdateRequestDto {

    @NotBlank(message = "질문을 입력해주세요.")
    private String question;

    @NotBlank(message = "답변을 입력해주세요.")
    private String answer;
}