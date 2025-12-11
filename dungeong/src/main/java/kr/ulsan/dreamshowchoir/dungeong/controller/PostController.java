package kr.ulsan.dreamshowchoir.dungeong.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.ulsan.dreamshowchoir.dungeong.dto.common.PageResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.post.PostCreateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.post.PostListResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.post.PostResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.post.PostUpdateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.service.PostService;
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

import java.util.List;

@Tag(name = "Post (단원 게시판)", description = "단원 전용 게시판 관련 API")
@RestController
@RequestMapping("/api/posts") // 게시글 API의 공통 주소
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    /**
     * 새로운 게시글을 생성하는 API
     * (단원 전용 - MEM004 기능. SecurityConfig에서 권한 설정 필요)
     *
     * @param requestDto 게시글 제목, 내용 (JSON)
     * @param userId     JWT 토큰에서 추출한 현재 로그인한 사용자의 ID
     * @return 생성된 게시글의 상세 정보 (JSON)
     */
    @Operation(summary = "게시글 생성", description = "새로운 게시글을 생성합니다. 파일 첨부가 가능합니다.")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponseDto> createPost(
            @Valid @RequestPart(value = "dto") PostCreateRequestDto requestDto, // JSON Body와 Validation
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal Long userId // JWT에서 추출한 사용자 ID
    ) {

        // Service를 호출하여 게시글 생성
        PostResponseDto createdPost = postService.createPost(requestDto, files, userId);

        // 201 Created 상태 코드와 함께 생성된 게시글 정보 반환
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    /**
     * 게시글 목록을 페이징하여 조회하는 API
     * (GET /api/posts?page=0&size=10&sort=createdAt,desc)
     * (MEMBER 권한 필요 - SecurityConfig에서 설정)
     *
     * @param pageable 쿼리 파라미터 (page, size, sort)
     * @return 페이징된 게시글 목록 (JSON)
     */
    @Operation(summary = "게시글 목록 조회", description = "게시글 목록을 페이징하여 조회합니다.")
    @GetMapping
    public ResponseEntity<PageResponseDto<PostListResponseDto>> getPostList(
            // 쿼리 파라미터를 Pageable 객체로 자동 변환
            // (size=10, sort=createdAt, desc를 기본값으로 설정)
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {

        PageResponseDto<PostListResponseDto> postList = postService.getPostList(pageable);

        // 200 OK 상태와 함께 목록 반환
        return ResponseEntity.ok(postList);
    }

    /**
     * 게시글 1건을 상세 조회하는 API
     * (GET /api/posts/{postId})
     * (MEMBER 권한 필요 - SecurityConfig에서 설정됨)
     *
     * @param postId URL 경로에서 추출한 게시글 ID
     * @return 게시글 상세 정보 (JSON)
     */
    @Operation(summary = "게시글 상세 조회", description = "특정 게시글의 상세 정보를 조회합니다.")
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponseDto> getPostDetail(
            @PathVariable Long postId // URL 경로의 {postId} 값을 Long postId 변수에 주입
    ) {
        // Service를 호출하여 상세 정보 DTO를 받아옴
        PostResponseDto postDetail = postService.getPostDetail(postId);

        // 200 OK 상태와 함께 상세 정보 반환
        return ResponseEntity.ok(postDetail);
    }

    /**
     * 게시글을 수정하는 API
     * (PATCH /api/posts/{postId})
     *
     * @param postId     URL 경로에서 추출한 게시글 ID
     * @param requestDto 수정할 제목, 내용 (JSON)
     * @param userId     JWT 토큰에서 추출한 현재 로그인한 사용자의 ID
     * @return 수정된 게시글의 상세 정보 (JSON)
     */
    @Operation(summary = "게시글 수정", description = "자신이 작성한 게시글을 수정합니다. 파일 첨부/변경이 가능합니다.")
    @PatchMapping("/{postId}")
    public ResponseEntity<PostResponseDto> updatePost(
            @PathVariable Long postId,
            @Valid @RequestPart(value = "dto") PostUpdateRequestDto requestDto, // 수정용 DTO
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal Long userId // 권한 검사를 위한 사용자 ID
    ) {
        // Service를 호출하여 게시글 수정
        PostResponseDto updatedPost = postService.updatePost(postId, requestDto, files, userId);

        // 200 OK 상태와 함께 수정된 게시글 정보 반환
        return ResponseEntity.ok(updatedPost);
    }

    /**
     * 게시글을 삭제하는 API
     * (DELETE /api/posts/{postId})
     * (작성자 본인 또는 ADMIN 권한 필요)
     *
     * @param postId URL 경로에서 추출한 게시글 ID
     * @param userId JWT 토큰에서 추출한 현재 로그인한 사용자의 ID
     * @return 204 No Content
     */
    @Operation(summary = "게시글 삭제", description = "자신이 작성한 게시글을 삭제합니다.")
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal Long userId // 권한 검사를 위한 사용자 ID
    ) {

        // Service를 호출하여 게시글 삭제
        postService.deletePost(postId, userId);

        // 204 No Content: 성공적으로 삭제되었으며, 반환할 본문(Body)이 없음
        return ResponseEntity.noContent().build();
    }
}