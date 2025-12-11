package kr.ulsan.dreamshowchoir.dungeong.dto.post;

import jakarta.validation.constraints.NotBlank;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.Post;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostCreateRequestDto {

    @NotBlank(message = "제목을 입력해주세요.") // 빈 값(null, "", " ")을 허용하지 않음
    private String title;

    @NotBlank(message = "내용을 입력해주세요.")
    private String content;

    // DTO를 Entity로 변환하는 편의 메소드
    public Post toEntity(User user) {
        return Post.builder()
                .title(this.title)
                .content(this.content)
                .user(user) // 작성자(User 엔티티)를 주입
                .build();
    }
}