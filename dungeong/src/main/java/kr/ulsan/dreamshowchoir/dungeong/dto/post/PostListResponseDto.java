package kr.ulsan.dreamshowchoir.dungeong.dto.post;

import kr.ulsan.dreamshowchoir.dungeong.domain.post.Post;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 게시글 '목록' 조회를 위한 DTO (본문 제외)
 */
@Getter
public class PostListResponseDto {

    private final Long postId;
    private final String title;
    private final String authorName;
    private final LocalDateTime createdAt;
    private final int commentCount;
    private final String authorProfileImage;

    /**
     * Post 엔티티를 PostListResponseDto로 변환
     */
    public PostListResponseDto(Post post) {
        this.postId = post.getPostId();
        this.title = post.getTitle();
        this.authorName = post.getUser().getName(); // N+1 문제 방지를 위해 Fetch Join 필요
        this.createdAt = post.getCreatedAt();
        this.commentCount = post.getComments() != null ? post.getComments().size() : 0;
        this.authorProfileImage = post.getUser().getProfileImageKey();
    }
}