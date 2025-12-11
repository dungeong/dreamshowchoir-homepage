package kr.ulsan.dreamshowchoir.dungeong.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.ulsan.dreamshowchoir.dungeong.dto.content.SiteContentResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.service.SiteContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Site Content (통합 콘텐츠)", description = "사이트 소개, 모집 안내 등 정적 콘텐츠 관련 API")
@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class SiteContentController {

    private final SiteContentService siteContentService;

    /**
     * 콘텐츠 조회 API (전체 공개)
     * (GET /api/content/{contentKey})
     * (예: /api/content/RECRUIT_GUIDE)
     */
    @Operation(summary = "통합 콘텐츠 조회", description = "contentKey를 사용하여 특정 통합 콘텐츠를 조회합니다.")
    @GetMapping("/{contentKey}")
    public ResponseEntity<SiteContentResponseDto> getSiteContent(
            @PathVariable String contentKey
    ) {
        SiteContentResponseDto content = siteContentService.getSiteContent(contentKey);
        return ResponseEntity.ok(content);
    }

}