package kr.ulsan.dreamshowchoir.dungeong.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.ulsan.dreamshowchoir.dungeong.dto.activity.ActivityMaterialResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.common.PageResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.service.ActivityMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Activity-Material(활동자료)", description = "활동자료 API")
@RestController
@RequestMapping("/api/activity-materials") // 활동자료 API의 공통 주소
@RequiredArgsConstructor
public class ActivityMaterialController {

    private final ActivityMaterialService activityMaterialService;

    /**
     * 활동자료 목록 조회 API
     * (GET /api/activity-materials?page=0&size=10&sort=createdAt,desc)
     * (전체 공개)
     *
     * @param pageable 쿼리 파라미터 (page, size, sort)
     * @return 페이징된 활동자료 목록 (JSON)
     */
    @Operation(summary = "활동자료 목록 조회", description = "최신순으로 정렬된 활동자료를 페이징하여 조회합니다.")
    @GetMapping
    public ResponseEntity<PageResponseDto<ActivityMaterialResponseDto>> getMaterialList(
            // 쿼리 파라미터를 Pageable 객체로 자동 변환
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {

        // Service를 호출하여 활동자료 목록 조회
        PageResponseDto<ActivityMaterialResponseDto> materialList = activityMaterialService.getMaterialList(pageable);

        // 200 OK 상태와 함께 목록 반환
        return ResponseEntity.ok(materialList);
    }

    /**
     * 활동자료 1건을 상세 조회하는 API
     * (GET /api/activity-materials/{materialId})
     * (전체 공개)
     *
     * @param materialId URL 경로에서 추출한 자료 ID
     * @return 활동자료 상세 정보 (JSON)
     */
    @Operation(summary = "활동자료 상세 조회", description = "활동자료 1건을 상세 조회합니다.")
    @GetMapping("/{materialId}")
    public ResponseEntity<ActivityMaterialResponseDto> getMaterialDetail(
            @PathVariable Long materialId // URL 경로의 {materialId} 값을 주입
    ) {

        // Service를 호출하여 상세 정보 DTO를 받아옴
        ActivityMaterialResponseDto materialDetail = activityMaterialService.getMaterialDetail(materialId);

        // 200 OK 상태와 함께 상세 정보 반환
        return ResponseEntity.ok(materialDetail);
    }
}