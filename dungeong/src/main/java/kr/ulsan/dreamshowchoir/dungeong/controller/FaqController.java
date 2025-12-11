package kr.ulsan.dreamshowchoir.dungeong.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.ulsan.dreamshowchoir.dungeong.dto.faq.FaqResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.service.FaqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "FAQ", description = "FAQ 관련 API")
@RestController
@RequestMapping("/api/faq")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    /**
     * FAQ 목록 전체 조회 API (전체 허용)
     * (GET /api/faq)
     */
    @Operation(summary = "FAQ 목록 전체 조회", description = "모든 FAQ 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<FaqResponseDto>> getFaqList() {
        List<FaqResponseDto> faqList = faqService.getFaqList();
        return ResponseEntity.ok(faqList);
    }

    /**
     * FAQ 상세 조회 API (전체 허용)
     * (GET /api/faq/{faqId})
     */
    @Operation(summary = "FAQ 상세 조회", description = "특정 FAQ의 상세 정보를 조회합니다.")
    @GetMapping("/{faqId}")
    public ResponseEntity<FaqResponseDto> getFaqDetail(
            @PathVariable Long faqId
    ) {
        FaqResponseDto faqDetail = faqService.getFaqDetail(faqId);
        return ResponseEntity.ok(faqDetail);
    }
}