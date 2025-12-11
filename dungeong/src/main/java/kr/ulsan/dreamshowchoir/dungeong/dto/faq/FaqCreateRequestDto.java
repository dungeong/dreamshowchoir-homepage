package kr.ulsan.dreamshowchoir.dungeong.dto.faq;

import jakarta.validation.constraints.NotBlank;
import kr.ulsan.dreamshowchoir.dungeong.domain.communicate.Faq;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FaqCreateRequestDto {

    @NotBlank(message = "질문을 입력해주세요.")
    private String question;

    @NotBlank(message = "답변을 입력해주세요.")
    private String answer;

    /**
     * DTO를 Faq 엔티티로 변환하는 편의 메소드
     */
    public Faq toEntity() {
        return Faq.builder()
                .question(this.question)
                .answer(this.answer)
                .build();
    }
}