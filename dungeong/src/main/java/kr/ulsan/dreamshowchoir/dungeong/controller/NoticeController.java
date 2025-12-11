package kr.ulsan.dreamshowchoir.dungeong.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.ulsan.dreamshowchoir.dungeong.dto.common.PageResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.notice.NoticeListResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.notice.NoticeResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Notice (공지사항)", description = "공지사항 관련 API")
@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;


    /**
     * 공지사항 목록 조회 API
     * (GET /api/notices?page=0&size=10&sort=createdAt,desc)
     *
     * @param pageable 쿼리 파라미터 (page, size, sort)
     * @return 페이징된 공지사항 목록 (JSON)
     */
    @Operation(summary = "공지사항 목록 조회", description = "공지사항 목록을 페이징하여 조회합니다.")
    @GetMapping
    public ResponseEntity<PageResponseDto<NoticeListResponseDto>> getNoticeList(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        PageResponseDto<NoticeListResponseDto> noticeList = noticeService.getNoticeList(pageable);

        return ResponseEntity.ok(noticeList);
    }

    /**
     * 공지사항 상세 조회 API
     * (GET /api/notices/{noticeId})
     *
     * @param noticeId URL 경로에서 추출한 공지사항 ID
     * @return 공지사항 상세 정보 (JSON)
     */
    @Operation(summary = "공지사항 상세 조회", description = "특정 공지사항의 상세 정보를 조회합니다.")
    @GetMapping("/{noticeId}")
    public ResponseEntity<NoticeResponseDto> getNoticeDetail(
            @PathVariable Long noticeId
    ) {
        NoticeResponseDto noticeDetail = noticeService.getNoticeDetail(noticeId);
        return ResponseEntity.ok(noticeDetail);
    }


}