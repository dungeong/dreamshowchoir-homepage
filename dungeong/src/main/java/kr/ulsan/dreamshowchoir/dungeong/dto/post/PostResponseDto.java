package kr.ulsan.dreamshowchoir.dungeong.dto.post;

import kr.ulsan.dreamshowchoir.dungeong.domain.post.Post;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class PostResponseDto {

    private final Long postId;
    private final String title;
    private final String content;
    private final String authorName; // User 엔티티 전체 대신, 작성자 이름만
    private final Long authorId;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final List<PostImageDto> images;
    private final String authorProfileImage;

    /**
     * Entity를 DTO로 변환하는 생성자
     */
    public PostResponseDto(Post post) {
        this.postId = post.getPostId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.authorName = post.getUser().getName(); // User 객체에서 이름만 추출
        this.authorId = post.getUser().getUserId();
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
        this.images = post.getPostImages().stream()
                .map(PostImageDto::new)
                .collect(Collectors.toList());
        this.authorProfileImage = post.getUser().getProfileImageKey();
    }
}