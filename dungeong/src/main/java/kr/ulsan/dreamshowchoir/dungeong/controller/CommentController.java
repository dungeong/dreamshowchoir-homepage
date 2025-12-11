package kr.ulsan.dreamshowchoir.dungeong.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.ulsan.dreamshowchoir.dungeong.dto.comment.CommentCreateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.comment.CommentResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.comment.CommentUpdateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Comment (댓글)", description = "게시글 댓글 관련 API")
@RestController
@RequestMapping("/api/posts/{postId}/comments") // API 공통 주소
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    /**
     * 새로운 댓글을 생성하는 API
     * (POST /api/posts/{postId}/comments)
     * (MEMBER 권한 필요 - SecurityConfig에서 설정 필요)
     *
     * @param postId     URL 경로에서 추출한 게시글 ID
     * @param requestDto 댓글 내용 (JSON)
     * @param userId     JWT 토큰에서 추출한 현재 로그인한 사용자의 ID
     * @return 생성된 댓글의 상세 정보 (JSON)
     */
    @Operation(summary = "댓글 생성", description = "특정 게시글에 새로운 댓글을 생성합니다.")
    @PostMapping
    public ResponseEntity<CommentResponseDto> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentCreateRequestDto requestDto, // JSON Body
            @AuthenticationPrincipal Long userId // JWT에서 추출한 사용자 ID
    ) {

        // Service를 호출하여 댓글 생성
        CommentResponseDto createdComment = commentService.createComment(postId, requestDto, userId);

        // 201 Created 상태 코드와 함께 생성된 댓글 정보 반환
        return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
    }

    /**
     * 특정 게시글의 댓글 목록을 조회하는 API
     * (GET /api/posts/{postId}/comments)
     * (MEMBER 권한 필요 - SecurityConfig에서 설정 필요)
     *
     * @param postId URL 경로에서 추출한 게시글 ID
     * @return 댓글 목록 (JSON Array)
     */
    @Operation(summary = "댓글 목록 조회", description = "특정 게시글의 모든 댓글 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<CommentResponseDto>> getCommentList(
            @PathVariable Long postId
    ) {

        // Service를 호출하여 댓글 목록 DTO를 받아옴
        List<CommentResponseDto> commentList = commentService.getCommentList(postId);

        // 200 OK 상태와 함께 목록 반환
        return ResponseEntity.ok(commentList);
    }

    /**
     * 댓글 수정 API
     * (PATCH /api/posts/{postId}/comments/{commentId})
     *
     * @param postId     (URL 경로, 여기서는 사용 X)
     * @param commentId  수정할 댓글 ID
     * @param requestDto 수정할 내용 (JSON)
     * @param userId     현재 로그인한 사용자 ID
     * @return 수정된 댓글 상세 정보 (JSON)
     */
    @Operation(summary = "댓글 수정", description = "자신이 작성한 댓글의 내용을 수정합니다.")
    @PatchMapping("/{commentId}")
    public ResponseEntity<CommentResponseDto> updateComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentUpdateRequestDto requestDto,
            @AuthenticationPrincipal Long userId
    ) {
        CommentResponseDto updatedComment = commentService.updateComment(commentId, requestDto, userId);
        return ResponseEntity.ok(updatedComment);
    }


    /**
     * 댓글 삭제 API
     * (DELETE /api/posts/{postId}/comments/{commentId})
     *
     * @param postId    (URL 경로, 여기서는 사용 X)
     * @param commentId 삭제할 댓글 ID
     * @param userId    현재 로그인한 사용자 ID
     * @return 204 No Content
     */
    @Operation(summary = "댓글 삭제", description = "자신이 작성한 댓글을 삭제합니다.")
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal Long userId
    ) {
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}