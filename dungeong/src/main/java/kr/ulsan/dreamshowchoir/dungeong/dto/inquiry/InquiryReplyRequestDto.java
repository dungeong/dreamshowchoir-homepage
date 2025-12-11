package kr.ulsan.dreamshowchoir.dungeong.dto.inquiry;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InquiryReplyRequestDto {

    @NotBlank(message = "답변 내용을 입력해주세요.")
    private String answer;
}