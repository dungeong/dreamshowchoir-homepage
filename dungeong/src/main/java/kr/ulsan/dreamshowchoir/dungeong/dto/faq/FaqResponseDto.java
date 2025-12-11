package kr.ulsan.dreamshowchoir.dungeong.dto.faq;

import kr.ulsan.dreamshowchoir.dungeong.domain.communicate.Faq;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class FaqResponseDto {

    private final Long faqId;
    private final String question;
    private final String answer;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    /**
     * Entity를 DTO로 변환하는 생성자
     */
    public FaqResponseDto(Faq faq) {
        this.faqId = faq.getFaqId();
        this.question = faq.getQuestion();
        this.answer = faq.getAnswer();
        this.createdAt = faq.getCreatedAt();
        this.updatedAt = faq.getUpdatedAt();
    }
}