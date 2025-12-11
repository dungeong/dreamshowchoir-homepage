package kr.ulsan.dreamshowchoir.dungeong.service;

import jakarta.persistence.EntityNotFoundException;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.Comment;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.Post;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.repository.CommentRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.repository.PostRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.UserRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.comment.CommentCreateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.comment.CommentResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.comment.CommentUpdateRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository; // PostRepository 주입
    private final UserRepository userRepository; // UserRepository 주입

    /**
     * 새로운 댓글을 생성
     *
     * @param postId     댓글이 달릴 게시글의 ID
     * @param requestDto 댓글 내용 DTO
     * @param userId     현재 인증된 사용자의 ID (JWT 토큰에서 추출)
     * @return 생성된 댓글의 상세 정보 DTO
     */
    public CommentResponseDto createComment(Long postId, CommentCreateRequestDto requestDto, Long userId) {

        // 작성자(User) 엔티티를 DB에서 조회
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 유저를 찾을 수 없습니다: " + userId));

        // 댓글이 달릴 게시글(Post) 엔티티를 DB에서 조회 (findByIdWithUser는 User만 패치하므로, 댓글에는 일반 findById 사용)
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 게시글을 찾을 수 없습니다: " + postId));

        // DTO의 toEntity() 헬퍼 메소드를 사용해 Comment 엔티티 생성
        Comment newComment = requestDto.toEntity(post, author);

        // Repository를 통해 엔티티를 DB에 저장
        Comment savedComment = commentRepository.save(newComment);

        // 저장된 엔티티를 Response DTO로 변환하여 컨트롤러에 반환
        return new CommentResponseDto(savedComment);
    }

    /**
     * 특정 게시글의 모든 댓글 목록을 조회
     * (논리 삭제된 댓글 제외)
     *
     * @param postId 조회할 게시글의 ID
     * @return 댓글 DTO 리스트
     */
    @Transactional(readOnly = true) // 조회(SELECT) 전용 (성능 최적화)
    public List<CommentResponseDto> getCommentList(Long postId) {

        // Post가 존재하는지 확인 (선택 사항이지만, 안정성을 위해 추가)
        if (!postRepository.existsById(postId)) {
            throw new EntityNotFoundException("해당 ID의 게시글을 찾을 수 없습니다: " + postId);
        }

        // Repository에서 Fetch Join이 적용된 쿼리 호출 (N+1 문제 방지: Comment 조회 시 User(authorName)도 함께 조회)
        List<Comment> comments = commentRepository.findAllByPostIdWithUser(postId);

        // List<Comment> (엔티티)를 List<CommentResponseDto> (DTO)로 변환
        return comments.stream()
                .map(CommentResponseDto::new) // (comment -> new CommentResponseDto(comment))
                .collect(Collectors.toList());
    }

    /**
     * 댓글 수정
     * (작성자 본인만 가능)
     *
     * @param commentId  수정할 댓글의 ID
     * @param requestDto 수정할 내용 DTO
     * @param userId     현재 인증된 사용자의 ID
     * @return 수정된 댓글의 상세 정보 DTO
     */
    public CommentResponseDto updateComment(Long commentId, CommentUpdateRequestDto requestDto, Long userId) {

        // 댓글을 DB에서 조회 (작성자 정보 포함)
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 댓글을 찾을 수 없습니다: " + commentId));

        // 권한 검사: 작성자 본인 확인
        if (!comment.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("이 댓글을 수정할 권한이 없습니다.");
        }

        // 엔티티의 update 헬퍼 메소드를 호출하여 내용 변경 (Comment 엔티티에 update(String content) 메소드가 있어야 함)
        comment.update(requestDto.getContent());

        // Comment 엔티티에는 updatedAt이 없으므로 flush()가 필요 없음
        // 변경된 엔티티를 DTO로 변환하여 반환
        return new CommentResponseDto(comment);
    }


    /**
     * 댓글 (논리) 삭제
     * (작성자 본인 또는 ADMIN 가능)
     *
     * @param commentId 삭제할 댓글의 ID
     * @param userId    현재 인증된 사용자의 ID
     */
    public void deleteComment(Long commentId, Long userId) {

        // 댓글을 DB에서 조회 (작성자 정보 포함)
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 댓글을 찾을 수 없습니다: " + commentId));

        // 권한 검사 - 현재 요청한 사용자가 ADMIN인지 확인
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 유저를 찾을 수 없습니다: " + userId));

        // 작성자 본인이거나 ADMIN이 아니면, 권한 없음 예외 발생
        boolean isOwner = comment.getUser().getUserId().equals(userId);
        boolean isAdmin = currentUser.getRole().equals(Role.ADMIN);

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("이 댓글을 삭제할 권한이 없습니다.");
        }

        // Repository의 delete() 호출 -> @SQLDelete(논리삭제) 쿼리 실행
        commentRepository.delete(comment);
    }
}