package kr.ulsan.dreamshowchoir.dungeong.domain.communicate.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.communicate.Inquiry;
import kr.ulsan.dreamshowchoir.dungeong.domain.communicate.InquiryStatus; // Enum import
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // PostgreSQL 사용
@Import(JpaAuditingConfig.class) // Auditing 기능(createdAt) 활성화
class InquiryRepositoryTest {

    @Autowired
    private InquiryRepository inquiryRepository;

    // Inquiry는 User에 의존하지 않음

    @Test
    @DisplayName("새로운 Inquiry를 저장하고 ID로 조회하면 성공 (기본 상태 PENDING)")
    void saveAndFindInquiryTest() {
        // given (준비)
        Inquiry newInquiry = Inquiry.builder()
                .name("문의자")
                .email("inquiry@example.com")
                .content("가입 관련 문의입니다.")
                .build();

        // when (실행)
        Inquiry savedInquiry = inquiryRepository.save(newInquiry);

        // then (검증)
        Inquiry foundInquiry = inquiryRepository.findById(savedInquiry.getInquiryId()).orElseThrow();

        assertThat(foundInquiry.getInquiryId()).isEqualTo(savedInquiry.getInquiryId());
        assertThat(foundInquiry.getName()).isEqualTo("문의자");
        assertThat(foundInquiry.getContent()).isEqualTo("가입 관련 문의입니다.");

        //  기본 상태가 'PENDING'인지 확인
        assertThat(foundInquiry.getStatus()).isEqualTo(InquiryStatus.PENDING);

        assertThat(foundInquiry.getAnswer()).isNull(); // 답변은 아직 없음
        assertThat(foundInquiry.getAnsweredAt()).isNull();
        assertThat(foundInquiry.getCreatedAt()).isNotNull(); // Auditing 검증
    }

    @Test
    @DisplayName("특정 상태(PENDING)의 문의 목록을 페이징 조회함")
    void findAllByStatusOrderByCreatedAtDescTest() {
        // given (준비)
        // PENDING 상태 문의 (오래된 것)
        inquiryRepository.saveAndFlush(Inquiry.builder()
                .name("문의자1")
                .email("q1@example.com")
                .content("문의 1 (대기)")
                .build()); // 기본값 PENDING

        // ANSWERED 상태 문의
        Inquiry answeredInquiry = inquiryRepository.saveAndFlush(Inquiry.builder()
                .name("문의자2")
                .email("q2@example.com")
                .content("문의 2 (답변완료)")
                .build());
        answeredInquiry.addAnswer("답변입니다."); // 상태 변경
        inquiryRepository.saveAndFlush(answeredInquiry);

        // PENDING 상태 문의 (최신)
        Inquiry pendingInquiry2 = inquiryRepository.saveAndFlush(Inquiry.builder()
                .name("문의자3")
                .email("q3@example.com")
                .content("문의 3 (대기)")
                .build()); // 기본값 PENDING

        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));

        // when (실행)
        Page<Inquiry> pendingInquiries = inquiryRepository.findAllByStatusOrderByCreatedAtDesc(InquiryStatus.PENDING, pageRequest);

        // then (검증)
        assertThat(pendingInquiries.getTotalElements()).isEqualTo(2); // PENDING 2개만 조회
        assertThat(pendingInquiries.getContent()).hasSize(2);
        // 최신순 정렬 검증 (문의자3이 먼저)
        assertThat(pendingInquiries.getContent().get(0).getInquiryId()).isEqualTo(pendingInquiry2.getInquiryId());
        assertThat(pendingInquiries.getContent().get(0).getName()).isEqualTo("문의자3");
    }

    @Test
    @DisplayName("문의에 답변(addAnswer)하면 상태와 답변 시각이 변경됨")
    void addAnswerTest() {
        // given (준비)
        Inquiry inquiry = inquiryRepository.save(Inquiry.builder()
                .name("문의자")
                .email("q@example.com")
                .content("질문입니다.")
                .build());
        Long inquiryId = inquiry.getInquiryId();

        // when (실행)
        Inquiry foundInquiry = inquiryRepository.findById(inquiryId).orElseThrow();
        foundInquiry.addAnswer("답변 내용입니다."); // 엔티티 편의 메소드 사용
        inquiryRepository.saveAndFlush(foundInquiry); // 변경사항 DB 반영

        // then (검증)
        Inquiry answeredInquiry = inquiryRepository.findById(inquiryId).orElseThrow();
        assertThat(answeredInquiry.getAnswer()).isEqualTo("답변 내용입니다.");
        assertThat(answeredInquiry.getStatus()).isEqualTo(InquiryStatus.ANSWERED);
        assertThat(answeredInquiry.getAnsweredAt()).isNotNull(); // 답변 시각이 기록되었는지
    }
}