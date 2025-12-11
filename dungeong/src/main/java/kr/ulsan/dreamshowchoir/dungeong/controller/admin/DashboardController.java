package kr.ulsan.dreamshowchoir.dungeong.controller.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.ulsan.dreamshowchoir.dungeong.dto.admin.DashboardDto;
import kr.ulsan.dreamshowchoir.dungeong.service.admin.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "관리자 대시보드 API", description = "관리자 메인 페이지용 데이터 집계 API")
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "대시보드 데이터 조회", description = "대기중인 작업, 월간 통계, 예정된 일정, 최근 게시글을 조회합니다.")
    @GetMapping
    public ResponseEntity<DashboardDto> getDashboardData() {
        return ResponseEntity.ok(dashboardService.getDashboardData());
    }
}
