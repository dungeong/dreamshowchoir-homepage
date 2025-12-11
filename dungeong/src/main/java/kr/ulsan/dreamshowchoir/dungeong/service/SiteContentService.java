package kr.ulsan.dreamshowchoir.dungeong.service;

import jakarta.persistence.EntityNotFoundException;
import kr.ulsan.dreamshowchoir.dungeong.domain.content.SiteContent;
import kr.ulsan.dreamshowchoir.dungeong.domain.content.repository.SiteContentRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.content.SiteContentCreateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.content.SiteContentResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.content.SiteContentUpdateRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SiteContentService {

    private final SiteContentRepository siteContentRepository;

    /**
     * 정적 콘텐츠를 생성 (ADMIN 전용)
     */
    public SiteContentResponseDto createSiteContent(SiteContentCreateRequestDto requestDto) {

        // 이미 해당 키가 있는지 확인
        String key = requestDto.getContentKey().toUpperCase();
        if (siteContentRepository.existsById(key)) {
            throw new IllegalArgumentException("이미 존재하는 콘텐츠 키(Key)입니다: " + key);
        }

        SiteContent newContent = requestDto.toEntity();
        SiteContent savedContent = siteContentRepository.save(newContent);
        return new SiteContentResponseDto(savedContent);
    }

    /**
     * 특정 키(Key)의 콘텐츠를 조회 (전체 공개)
     */
    @Transactional(readOnly = true)
    public SiteContentResponseDto getSiteContent(String contentKey) {

        SiteContent content = siteContentRepository.findById(contentKey.toUpperCase())
                .orElseThrow(() -> new EntityNotFoundException("해당 키의 콘텐츠를 찾을 수 없습니다: " + contentKey));

        return new SiteContentResponseDto(content);
    }

    /**
     * 특정 키(Key)의 콘텐츠를 수정 (ADMIN 전용)
     */
    public SiteContentResponseDto updateSiteContent(String contentKey, SiteContentUpdateRequestDto requestDto) {

        SiteContent content = siteContentRepository.findById(contentKey.toUpperCase())
                .orElseThrow(() -> new EntityNotFoundException("해당 키의 콘텐츠를 찾을 수 없습니다: " + contentKey));

        // 엔티티 헬퍼 메소드로 수정
        content.update(requestDto.getContent());

        // updatedAt 갱신을 위해 flush (SiteContent는 Auditing 사용)
        siteContentRepository.flush();

        return new SiteContentResponseDto(content);
    }

    /**
     * 특정 키(Key)의 콘텐츠를 삭제 (ADMIN 전용)
     */
    public void deleteSiteContent(String contentKey) {

        SiteContent content = siteContentRepository.findById(contentKey.toUpperCase())
                .orElseThrow(() -> new EntityNotFoundException("해당 키의 콘텐츠를 찾을 수 없습니다: " + contentKey));

        // 물리 삭제 (SiteContent는 논리 삭제가 아님)
        siteContentRepository.delete(content);
    }
}