package kr.ulsan.dreamshowchoir.dungeong.dto.comment;

import kr.ulsan.dreamshowchoir.dungeong.domain.post.Comment;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CommentResponseDto {

    private final Long commentId;
    private final String content;
    private final String authorName;
    private final Long authorId;
    private final Long postId;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final String authorProfileImage;


    /**
     * Entity를 DTO로 변환하는 생성자
     */
    public CommentResponseDto(Comment comment) {
        this.commentId = comment.getCommentId();
        this.content = comment.getContent();
        this.authorName = comment.getUser().getName();
        this.authorId = comment.getUser().getUserId();
        this.postId = comment.getPost().getPostId();
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();
        this.authorProfileImage = comment.getUser().getProfileImageKey();
    }
}