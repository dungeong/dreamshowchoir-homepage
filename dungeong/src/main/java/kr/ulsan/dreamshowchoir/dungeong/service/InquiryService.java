package kr.ulsan.dreamshowchoir.dungeong.service;

import jakarta.persistence.EntityNotFoundException;
import kr.ulsan.dreamshowchoir.dungeong.domain.communicate.Inquiry;
import kr.ulsan.dreamshowchoir.dungeong.domain.communicate.repository.InquiryRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.common.PageResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.inquiry.InquiryCreateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.inquiry.InquiryReplyRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.inquiry.InquiryResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final RecaptchaService recaptchaService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    /**
     * 문의 생성 (비로그인 사용자)
     */
    public InquiryResponseDto createInquiry(InquiryCreateRequestDto requestDto) {

        // reCAPTCHA 토큰 검증
        boolean isValidRecaptcha = recaptchaService.validateToken(requestDto.getRecaptchaToken());
        if (!isValidRecaptcha) {
            // 스팸(봇)으로 판단되면 403 Forbidden (또는 400 Bad Request)
            throw new AccessDeniedException("유효하지 않은 reCAPTCHA 토큰입니다. (스팸으로 의심됨)");
        }

        // DTO를 Entity로 변환 (Status는 PENDING으로 자동 설정됨)
        Inquiry newInquiry = requestDto.toEntity();

        // DB에 저장
        Inquiry savedInquiry = inquiryRepository.save(newInquiry);

        // DTO로 변환하여 반환
        return new InquiryResponseDto(savedInquiry);
    }

    /**
     * (관리자용) 특정 상태의 문의 목록 조회
     */
    @Transactional(readOnly = true)
    public PageResponseDto<InquiryResponseDto> getInquiryListByStatus(String statusString, Pageable pageable) {

        // String을 InquiryStatus Enum으로 변환
        // (StatusUpdateRequestDto와 동일한 로직)
        kr.ulsan.dreamshowchoir.dungeong.domain.communicate.InquiryStatus status;
        try {
            status = kr.ulsan.dreamshowchoir.dungeong.domain.communicate.InquiryStatus.valueOf(statusString.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("요청 상태(PENDING/ANSWERED)가 올바르지 않습니다.");
        }

        // Repository에서 상태별 페이징 조회
        Page<Inquiry> inquiryPage = inquiryRepository.findAllByStatusOrderByCreatedAtDesc(status, pageable);

        // Page<Entity> -> Page<DTO> 변환
        Page<InquiryResponseDto> dtoPage = inquiryPage.map(InquiryResponseDto::new);

        // PageResponseDto(범용 DTO)로 감싸서 반환
        return new PageResponseDto<>(dtoPage);
    }


    /**
     * (관리자용) 답변 추가
     */
    public InquiryResponseDto replyToInquiry(Long inquiryId, InquiryReplyRequestDto requestDto) {

        // 문의 조회
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 문의를 찾을 수 없습니다: " + inquiryId));

        // 이미 답변했는지 확인 (중복 답변 방지)
        if (inquiry.getStatus() == kr.ulsan.dreamshowchoir.dungeong.domain.communicate.InquiryStatus.ANSWERED) {
            throw new IllegalStateException("이미 답변이 완료된 문의입니다.");
        }

        // 엔티티 헬퍼 메소드로 답변 추가 (Status -> ANSWERED, answeredAt 갱신)
        inquiry.addAnswer(requestDto.getAnswer());

        // 이메일 발송
        String emailSubject = "[드림쇼콰이어] 문의하신 내용에 대한 답변이 등록되었습니다.";
        String emailContent = createEmailContent(inquiry.getName(), inquiry.getContent(), requestDto.getAnswer());

        emailService.sendEmail(inquiry.getEmail(), emailSubject, emailContent);

        return new InquiryResponseDto(inquiry);
    }

    // 이메일 본문 생성 헬퍼 (HTML)
    private String createEmailContent(String name, String question, String answer) {
        return "<div style='margin:20px;'>" +
                "<h2>안녕하세요, 드림쇼콰이어입니다.</h2>" +
                "<p><strong>" + name + "</strong>님께서 문의하신 내용에 대한 답변입니다.</p>" +
                "<br>" +
                "<div style='background-color:#f5f5f5; padding:15px; border-radius:5px;'>" +
                "<h4>Q. 문의 내용</h4>" +
                "<p>" + question.replace("\n", "<br>") + "</p>" +
                "</div>" +
                "<br>" +
                "<div style='border-left: 4px solid #4CAF50; padding-left: 15px;'>" +
                "<h4>A. 답변 내용</h4>" +
                "<p>" + answer.replace("\n", "<br>") + "</p>" +
                "</div>" +
                "<br>" +
                "<p>더 궁금한 점이 있으시면 언제든 문의해주세요.</p>" +
                "<p>감사합니다.</p>" +
                "</div>";
    }
}