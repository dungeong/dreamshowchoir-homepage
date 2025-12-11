package kr.ulsan.dreamshowchoir.dungeong.service;

import jakarta.persistence.EntityNotFoundException;
import kr.ulsan.dreamshowchoir.dungeong.domain.communicate.Faq;
import kr.ulsan.dreamshowchoir.dungeong.domain.communicate.repository.FaqRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.faq.FaqCreateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.faq.FaqResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.faq.FaqUpdateRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FaqService {

    private final FaqRepository faqRepository;

    /**
     * 새로운 FAQ를 생성 (ADMIN 전용)
     */
    public FaqResponseDto createFaq(FaqCreateRequestDto requestDto) {
        Faq newFaq = requestDto.toEntity();
        Faq savedFaq = faqRepository.save(newFaq);
        return new FaqResponseDto(savedFaq);
    }

    /**
     * FAQ 목록 전체를 조회 (전체 허용)
     */
    @Transactional(readOnly = true)
    public List<FaqResponseDto> getFaqList() {
        // Repository에서 최신순으로 정렬하여 조회
        List<Faq> faqs = faqRepository.findAllByOrderByCreatedAtDesc();

        // List<Faq> -> List<FaqResponseDto> 변환
        return faqs.stream()
                .map(FaqResponseDto::new)
                .collect(Collectors.toList());
    }

    /**
     * FAQ 상세 조회 (전체 허용)
     * (현재 목록 조회와 응답 DTO가 동일하지만, 추후 확장을 위해 분리)
     */
    @Transactional(readOnly = true)
    public FaqResponseDto getFaqDetail(Long faqId) {
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 FAQ를 찾을 수 없습니다: " + faqId));
        return new FaqResponseDto(faq);
    }

    /**
     * FAQ 수정 (ADMIN 전용)
     */
    public FaqResponseDto updateFaq(Long faqId, FaqUpdateRequestDto requestDto) {
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 FAQ를 찾을 수 없습니다: " + faqId));

        // 엔티티 헬퍼 메소드로 수정
        faq.update(requestDto.getQuestion(), requestDto.getAnswer());

        // updatedAt 갱신을 위해 flush
        faqRepository.flush();

        return new FaqResponseDto(faq);
    }

    /**
     * FAQ 삭제 (ADMIN 전용)
     */
    public void deleteFaq(Long faqId) {
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 FAQ를 찾을 수 없습니다: " + faqId));

        // 물리 삭제 (Faq 엔티티는 논리 삭제가 아님)
        faqRepository.delete(faq);
    }
}