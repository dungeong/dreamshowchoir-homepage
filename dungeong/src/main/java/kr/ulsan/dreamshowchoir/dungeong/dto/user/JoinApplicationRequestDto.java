package kr.ulsan.dreamshowchoir.dungeong.dto.user;

import jakarta.validation.constraints.NotBlank;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.JoinApplication;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JoinApplicationRequestDto {

    @NotBlank(message = "희망 파트를 선택해주세요.")
    private String part;

    // 자기소개 항목들도 Validation 추가 가능
    private String interests;
    private String myDream;
    private String hashTags;
    private String profileImage;

    /**
     * DTO를 JoinApplication 엔티티로 변환하는 편의 메소드
     */
    public JoinApplication toEntity(User user) {
        return JoinApplication.builder()
                .user(user)
                .part(this.part)
                .interests(this.interests)
                .myDream(this.myDream)
                .hashTags(this.hashTags)
                .profileImage(this.profileImage)
                .build();
    }
}