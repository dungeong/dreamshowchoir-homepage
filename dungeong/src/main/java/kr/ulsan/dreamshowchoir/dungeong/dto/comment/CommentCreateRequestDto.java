package kr.ulsan.dreamshowchoir.dungeong.dto.comment;

import jakarta.validation.constraints.NotBlank;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.Comment;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.Post;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CommentCreateRequestDto {

    @NotBlank(message = "댓글 내용을 입력해주세요.")
    private String content;

    // DTO를 Entity로 변환하는 편의 메소드
    public Comment toEntity(Post post, User user) {
        return Comment.builder()
                .content(this.content)
                .post(post) // 댓글이 달릴 게시글
                .user(user) // 댓글 작성자
                .build();
    }
}