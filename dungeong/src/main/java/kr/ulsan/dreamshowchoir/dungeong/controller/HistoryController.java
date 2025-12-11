package kr.ulsan.dreamshowchoir.dungeong.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.ulsan.dreamshowchoir.dungeong.dto.history.HistoryResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "History (연혁)", description = "연혁 관련 API")
@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;

    /**
     * 연혁 목록 조회 API (전체 공개)
     * (GET /api/history)
     */
    @Operation(summary = "연혁 목록 조회", description = "전체 연혁 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<HistoryResponseDto>> getHistoryList() {
        List<HistoryResponseDto> historyList = historyService.getHistoryList();
        return ResponseEntity.ok(historyList);
    }
}