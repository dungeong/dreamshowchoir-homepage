package kr.ulsan.dreamshowchoir.dungeong.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.ulsan.dreamshowchoir.dungeong.dto.common.PageResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.user.MemberProfileResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@Tag(name = "Info (공개 정보)", description = "로그인 없이 조회 가능한 공개 정보 API")
@RestController
@RequestMapping("/api/info") // 공개 정보 API 공통 주소
@RequiredArgsConstructor
public class InfoController {

    private final UserService userService;

    /**
     * 단원 소개 목록을 조회하는 API (공개 프로필만)
     * (GET /api/info/members?page=0&size=10&part=소프라노)
     * (전체 공개 - SecurityConfig에서 permitAll 필요)
     * part 파라미터가 없으면 전체 조회
     * 기본 정렬 : 이름순 (가나다)
     * @return 단원 목록 리스트 (민감정보 제외된 DTO)
     */
    @Operation(summary = "단원 소개 목록 조회", description = "공개 프로필로 설정된 단원 목록을 조회합니다.")
    @GetMapping("/members")
    public ResponseEntity<PageResponseDto<MemberProfileResponseDto>> getPublicMembers(
            @RequestParam(required = false) String part,
            @PageableDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        PageResponseDto<MemberProfileResponseDto> members = userService.getPublicMembers(part, pageable);
        return ResponseEntity.ok(members);
    }
}