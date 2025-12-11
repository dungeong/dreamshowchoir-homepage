package kr.ulsan.dreamshowchoir.dungeong.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.ulsan.dreamshowchoir.dungeong.dto.common.PageResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.sheet.SheetResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.service.SheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Sheet (악보/자료)", description = "단원 전용 악보/자료실 관련 API")
@RestController
@RequestMapping("/api/sheets") // 악보 API의 공통 주소
@RequiredArgsConstructor
public class SheetController {

    private final SheetService sheetService;

    /**
     * 악보/자료실 목록을 페이징하여 조회하는 API
     * (GET /api/sheets?page=0&size=10&sort=createdAt,desc)
     * (MEMBER 권한 필요 - SecurityConfig에서 설정됨)
     *
     * @param pageable 쿼리 파라미터 (page, size, sort)
     * @return 페이징된 악보 목록 (JSON)
     */
    @Operation(summary = "악보/자료 목록 조회", description = "악보/자료 목록을 페이징하여 조회합니다.")
    @GetMapping
    public ResponseEntity<PageResponseDto<SheetResponseDto>> getSheetList(
            // 쿼리 파라미터를 Pageable 객체로 자동 변환
            // (size=10, sort=createdAt, desc를 기본값으로 설정)
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {

        // Service를 호출하여 악보 목록 조회
        PageResponseDto<SheetResponseDto> sheetList = sheetService.getSheetList(pageable);

        // 200 OK 상태와 함께 목록 반환
        return ResponseEntity.ok(sheetList);
    }

    /**
     * 새로운 악보를 업로드하는 API
     * (POST /api/sheets)
     * (단원 전용 - MEMBER 권한 필요)
     *
     * @param file   업로드할 악보/음원 파일 (MultipartFile)
     * @param userId JWT 토큰에서 추출한 현재 로그인한 사용자의 ID
     * @return 생성된 악보의 상세 정보 (JSON)
     */
    @Operation(summary = "악보/자료 업로드", description = "새로운 악보나 자료 파일을 업로드합니다.")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SheetResponseDto> uploadSheet(
            @RequestPart(value = "file") MultipartFile file, // 단일 파일 업로드
            @AuthenticationPrincipal Long userId // JWT에서 추출한 사용자 ID
    ) {

        // Service를 호출하여 악보 업로드 및 저장
        SheetResponseDto createdSheet = sheetService.uploadSheet(file, userId);

        // 201 Created 상태 코드와 함께 생성된 악보 정보 반환
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSheet);
    }

    /**
     * 악보를 삭제하는 API
     * (DELETE /api/sheets/{sheetId})
     * (작성자 본인 또는 ADMIN 권한 필요)
     *
     * @param sheetId URL 경로에서 추출한 악보 ID
     * @param userId  JWT 토큰에서 추출한 현재 로그인한 사용자의 ID
     * @return 204 No Content
     */
    @Operation(summary = "악보/자료 삭제", description = "자신이 업로드한 악보나 자료를 삭제합니다.")
    @DeleteMapping("/{sheetId}")
    public ResponseEntity<Void> deleteSheet(
            @PathVariable Long sheetId, // URL 경로의 {sheetId} 값을 주입
            @AuthenticationPrincipal Long userId // 권한 검사를 위한 사용자 ID
    ) {

        // Service를 호출하여 악보 삭제 (S3 물리 삭제 + DB 논리 삭제)
        sheetService.deleteSheet(sheetId, userId);

        // 204 No Content : 성공적으로 삭제되었으며, 반환할 본문(Body)이 없음
        return ResponseEntity.noContent().build();
    }
}