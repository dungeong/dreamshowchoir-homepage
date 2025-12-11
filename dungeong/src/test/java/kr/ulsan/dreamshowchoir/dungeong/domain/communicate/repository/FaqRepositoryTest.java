package kr.ulsan.dreamshowchoir.dungeong.domain.communicate.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.communicate.Faq;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // PostgreSQL 사용
@Import(JpaAuditingConfig.class) // Auditing 기능(BaseAuditEntity) 활성화
class FaqRepositoryTest {

    @Autowired
    private FaqRepository faqRepository;

    // Faq는 User에 의존하지 않음

    @Test
    @DisplayName("새로운 Faq를 저장하고 ID로 조회하면 성공")
    void saveAndFindFaqTest() {
        // given (준비)
        Faq newFaq = Faq.builder()
                .question("Q. 정기 연습은 언제 하나요?")
                .answer("A. 매주 월요일 저녁 7시 30분에 진행합니다.")
                .build();

        // when (실행)
        Faq savedFaq = faqRepository.save(newFaq);

        // then (검증)
        Faq foundFaq = faqRepository.findById(savedFaq.getFaqId()).orElseThrow();

        assertThat(foundFaq.getFaqId()).isEqualTo(savedFaq.getFaqId());
        assertThat(foundFaq.getQuestion()).isEqualTo("Q. 정기 연습은 언제 하나요?");
        assertThat(foundFaq.getAnswer()).isEqualTo("A. 매주 월요일 저녁 7시 30분에 진행합니다.");
        assertThat(foundFaq.getCreatedAt()).isNotNull(); // BaseAuditEntity 검증
        assertThat(foundFaq.getUpdatedAt()).isNotNull(); // BaseAuditEntity 검증
    }

    @Test
    @DisplayName("FAQ 목록을 최신순(createdAt DESC)으로 조회한다.")
    void findAllByOrderByCreatedAtDescTest() {
        // given (준비)
        // 1. FAQ (오래된 것)
        faqRepository.saveAndFlush(Faq.builder()
                .question("Q1")
                .answer("A1")
                .build());

        // 2. FAQ (최신)
        Faq faq2 = faqRepository.saveAndFlush(Faq.builder()
                .question("Q2")
                .answer("A2")
                .build());

        // when (실행)
        List<Faq> faqs = faqRepository.findAllByOrderByCreatedAtDesc();

        // then (검증)
        assertThat(faqs).hasSize(2);
        // 최신순 정렬 검증 (Q2가 먼저)
        assertThat(faqs.get(0).getFaqId()).isEqualTo(faq2.getFaqId());
        assertThat(faqs.get(0).getQuestion()).isEqualTo("Q2");
    }

    @Test
    @DisplayName("FAQ 내용을 수정(update)하면 updatedAt이 갱신된다.")
    void updateContentTest() {
        // given (준비)
        Faq faq = faqRepository.save(Faq.builder()
                .question("Q1")
                .answer("A1")
                .build());
        Long faqId = faq.getFaqId();
        LocalDateTime initialUpdatedAt = faq.getUpdatedAt();

        // when (실행)
        // (시간차를 두기 위해 잠시 대기)
        try { Thread.sleep(10); } catch (InterruptedException e) {}

        Faq foundFaq = faqRepository.findById(faqId).orElseThrow();
        foundFaq.update("Q1 (수정)", "A1 (수정)"); // 엔티티 편의 메소드 사용
        faqRepository.saveAndFlush(foundFaq); // 변경사항 DB 반영

        // then (검증)
        Faq updatedFaq = faqRepository.findById(faqId).orElseThrow();
        assertThat(updatedFaq.getAnswer()).isEqualTo("A1 (수정)");
        // updatedAt 시간이 갱신되었는지 검증
        assertThat(updatedFaq.getUpdatedAt()).isAfter(initialUpdatedAt);
    }
}