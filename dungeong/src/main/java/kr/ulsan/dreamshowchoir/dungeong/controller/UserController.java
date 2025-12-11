package kr.ulsan.dreamshowchoir.dungeong.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.ulsan.dreamshowchoir.dungeong.dto.user.UserResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.user.UserSignUpRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.user.UserUpdateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "User (사용자)", description = "사용자 정보 관련 API")
@RestController
@RequestMapping("/api/users") // 공통 경로
@RequiredArgsConstructor
public class UserController {

    private final UserService userService; // 새로 만든 '추가 정보 입력' 로직 활용

    /**
     * 내 정보 조회 API
     * (GET /api/users/me)
     * (USER 권한 필요)
     *
     * @param userId JWT 토큰에서 추출한 사용자 ID
     * @return 내 상세 정보 (UserResponseDto)
     */
    @Operation(summary = "내 정보 조회", description = "현재 로그인한 사용자의 상세 정보를 조회합니다.")
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMyInfo(@AuthenticationPrincipal Long userId) {
        // 기존 AuthService에 만들어두신 getUserInfo() 메소드를 그대로 재사용합니다.
        UserResponseDto myInfo = userService.getMyInfo(userId);
        return ResponseEntity.ok(myInfo);
    }

    /**
     * 회원가입 마무리 (추가 정보 입력) API
     * (PATCH /api/users/sign-up)
     * (USER 권한 필요 - OAuth 로그인 직후 호출)
     *
     * @param requestDto 추가 입력 정보 (핸드폰, 생년월일, 약관동의 등)
     * @param userId     JWT 토큰에서 추출한 사용자 ID
     * @return 업데이트된 내 정보
     */
    @Operation(summary = "회원가입 추가 정보 입력", description = "OAuth 로그인 후 필요한 추가 정보를 입력하여 회원가입을 완료합니다.")
    @PatchMapping("/sign-up")
    public ResponseEntity<UserResponseDto> signUp(
            @Valid @RequestBody UserSignUpRequestDto requestDto,
            @AuthenticationPrincipal Long userId
    ) {
        // 새로 만든 UserService의 로직을 호출합니다.
        UserResponseDto updatedUser = userService.updateSignUpInfo(userId, requestDto);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * 내 정보 수정 API
     * (PATCH /api/users/me)
     */
    @Operation(summary = "내 정보 수정", description = "로그인한 사용자의 정보를 수정합니다.")
    @PatchMapping("/me")
    public ResponseEntity<UserResponseDto> updateMyInfo(
            @Valid @RequestBody UserUpdateRequestDto requestDto,
            @AuthenticationPrincipal Long userId
    ) {
        UserResponseDto updatedUser = userService.updateMyInfo(userId, requestDto);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * 회원 탈퇴 API
     * (DELETE /api/users/me)
     */
    @Operation(summary = "회원 탈퇴", description = "로그인한 사용자가 서비스를 탈퇴합니다.")
    @DeleteMapping("/me")
    public ResponseEntity<Void> withdraw(@AuthenticationPrincipal Long userId) {
        userService.withdraw(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 내 프로필 이미지 수정 API
     * (PATCH /api/users/me/image?target=USER) -> 기본 프로필 수정
     * (PATCH /api/users/me/image?target=MEMBER) -> 단원 프로필 수정
     * (로그인한 사용자 누구나 가능)
     */
    @Operation(summary = "내 프로필 이미지 수정", description = "로그인한 사용자의 프로필 이미지를 수정합니다.")
    @PatchMapping(value = "/me/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponseDto> updateProfileImage(
            @RequestPart(value = "file") MultipartFile file,
            @RequestParam(value = "target", defaultValue = "USER") String target,
            @AuthenticationPrincipal Long userId
    ) {
        UserResponseDto updatedUser = userService.updateProfileImage(userId, file, target);
        return ResponseEntity.ok(updatedUser);
    }
}