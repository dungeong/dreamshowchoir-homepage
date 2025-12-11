package kr.ulsan.dreamshowchoir.dungeong.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.ulsan.dreamshowchoir.dungeong.dto.user.JoinApplicationRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.user.JoinApplicationResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.service.JoinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Join (가입 신청)", description = "단원 가입 신청 관련 API")
@RestController
@RequestMapping("/api/join")
@RequiredArgsConstructor
public class JoinController {

    private final JoinService joinService;

    /**
     * 새로운 단원 가입 신청서를 제출하는 API
     * (POST /api/join)
     * (USER 권한 필요 - SecurityConfig에서 설정 필요)
     *
     * @param requestDto 신청서 내용 (JSON)
     * @param userId     JWT 토큰에서 추출한 현재 로그인한 사용자의 ID
     * @return 생성된 신청서의 상세 정보 (JSON)
     */
    @Operation(summary = "단원 가입 신청", description = "새로운 단원 가입 신청서를 제출합니다.")
    @PostMapping
    public ResponseEntity<JoinApplicationResponseDto> createJoinApplication(
            @Valid @RequestBody JoinApplicationRequestDto requestDto, // JSON Body와 Validation
            @AuthenticationPrincipal Long userId // JWT에서 추출한 사용자 ID
    ) {

        // Service를 호출하여 신청서 생성
        JoinApplicationResponseDto createdApplication = joinService.createJoinApplication(requestDto, userId);

        // 201 Created 상태 코드와 함께 생성된 신청서 정보 반환
        return ResponseEntity.status(HttpStatus.CREATED).body(createdApplication);
    }

    /**
     * 내 가입 신청 상태를 조회하는 API
     * (GET /api/join/me)
     *
     * @param userId JWT 토큰에서 추출한 현재 로그인한 사용자의 ID
     * @return 신청서 상세 정보 (JSON)
     */
    @Operation(summary = "내 가입 신청 상태 조회", description = "현재 로그인한 사용자의 가입 신청 상태를 조회합니다.")
    @GetMapping("/me")
    public ResponseEntity<List<JoinApplicationResponseDto>> getMyApplications(
            @AuthenticationPrincipal Long userId
    ) {
        // List 반환 (없으면 [])
        return ResponseEntity.ok(joinService.getMyApplications(userId));
    }
}