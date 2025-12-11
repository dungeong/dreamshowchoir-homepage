package kr.ulsan.dreamshowchoir.dungeong.dto.gallery;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import kr.ulsan.dreamshowchoir.dungeong.domain.gallery.Gallery;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GalleryCreateRequestDto {
    @NotNull(message = "갤러리 타입을 선택해주세요.")
    private String type;

    @NotBlank(message = "제목을 입력해주세요.")
    private String title;
    private String description;

    public Gallery toEntity(User user) {
        return Gallery.builder()
                .type(this.type)
                .title(this.title)
                .description(this.description)
                .user(user)
                .build();
    }
}