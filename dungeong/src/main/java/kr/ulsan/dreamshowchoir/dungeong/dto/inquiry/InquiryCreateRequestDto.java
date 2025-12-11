package kr.ulsan.dreamshowchoir.dungeong.dto.inquiry;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import kr.ulsan.dreamshowchoir.dungeong.domain.communicate.Inquiry;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InquiryCreateRequestDto {

    @NotBlank(message = "이름을 입력해주세요.")
    private String name;

    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    @NotBlank(message = "문의 내용을 입력해주세요.")
    private String content;

    @NotBlank(message = "reCAPTCHA 토큰이 필요합니다.")
    private String recaptchaToken;

    /**
     * DTO를 Inquiry 엔티티로 변환하는 편의 메소드
     */
    public Inquiry toEntity() {
        return Inquiry.builder()
                .name(this.name)
                .email(this.email)
                .content(this.content)
                .build();
    }
}