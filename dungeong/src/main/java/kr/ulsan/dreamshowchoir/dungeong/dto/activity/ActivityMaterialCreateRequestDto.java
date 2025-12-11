package kr.ulsan.dreamshowchoir.dungeong.dto.activity;

import jakarta.validation.constraints.NotBlank;
import kr.ulsan.dreamshowchoir.dungeong.domain.activity.ActivityMaterial;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ActivityMaterialCreateRequestDto {

    @NotBlank(message = "제목을 입력해주세요.")
    private String title;

    private String description;

    // 엔티티 변환 편의 메서드
    public ActivityMaterial toEntity(User user, String fileKey, String fileName, Long fileSize) {
        return ActivityMaterial.builder()
                .user(user)
                .title(this.title)
                .description(this.description)
                .fileKey(fileKey)
                .fileName(fileName)
                .fileSize(fileSize)
                .build();
    }
}