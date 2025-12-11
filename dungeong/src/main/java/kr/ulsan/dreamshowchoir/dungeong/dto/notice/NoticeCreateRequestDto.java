package kr.ulsan.dreamshowchoir.dungeong.dto.notice;

import jakarta.validation.constraints.NotBlank;
import kr.ulsan.dreamshowchoir.dungeong.domain.notice.Notice;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NoticeCreateRequestDto {

    @NotBlank(message = "제목을 입력해주세요.")
    private String title;

    @NotBlank(message = "내용을 입력해주세요.")
    private String content;

    /**
     * DTO를 Notice 엔티티로 변환하는 편의 메소드
     */
    public Notice toEntity(User user) {
        return Notice.builder()
                .title(this.title)
                .content(this.content)
                .user(user)
                .build();
    }
}