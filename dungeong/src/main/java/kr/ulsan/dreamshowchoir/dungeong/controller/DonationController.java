package kr.ulsan.dreamshowchoir.dungeong.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.ulsan.dreamshowchoir.dungeong.dto.donation.DonationRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.donation.DonationResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.donation.DonorResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.service.DonationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Donation (후원)", description = "후원 관련 API")
@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class DonationController {

    private final DonationService donationService;

    /**
     * 새로운 후원 신청을 제출하는 API
     * (POST /api/donations)
     *
     * @param requestDto 후원 금액, 타입 (JSON)
     * @param userId     JWT 토큰에서 추출한 현재 로그인한 사용자의 ID
     * @return 생성된 후원 신청의 상세 정보 (JSON)
     */
    @Operation(summary = "후원 신청", description = "새로운 후원을 신청합니다.")
    @PostMapping
    public ResponseEntity<DonationResponseDto> createDonation(
            @Valid @RequestBody DonationRequestDto requestDto,
            @AuthenticationPrincipal Long userId
    ) {

        // Service를 호출하여 후원 신청 생성
        DonationResponseDto createdDonation = donationService.createDonation(requestDto, userId);

        // 201 Created 상태 코드와 함께 생성된 신청서 정보 반환
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDonation);
    }

    /**
     * '내 후원 내역' 목록을 조회하는 API
     * (GET /api/donations/my)
     * (authenticated 권한 필요 - SecurityConfig에서 이미 설정됨)
     *
     * @param userId JWT 토큰에서 추출한 현재 로그인한 사용자의 ID
     * @return 후원 내역 목록 (JSON Array)
     */
    @Operation(summary = "내 후원 내역 조회", description = "현재 로그인한 사용자의 모든 후원 내역을 조회합니다.")
    @GetMapping("/my")
    public ResponseEntity<List<DonationResponseDto>> getMyDonations(
            @AuthenticationPrincipal Long userId // JWT에서 사용자 ID 추출
    ) {

        // Service를 호출하여 후원 내역 DTO 리스트를 받아옴
        List<DonationResponseDto> donationList = donationService.getMyDonations(userId);

        // 200 OK 상태와 함께 목록 반환
        return ResponseEntity.ok(donationList);
    }

    /**
     * 후원자 명단 조회 API
     * (GET /api/donations/donors)
     * (전체 공개)
     */
    @Operation(summary = "후원자 명단 조회", description = "후원자 명단(명예의 전당)을 조회합니다.")
    @GetMapping("/donors")
    public ResponseEntity<List<DonorResponseDto>> getDonors() {
        return ResponseEntity.ok(donationService.getDonorsHallOfFame());
    }
}