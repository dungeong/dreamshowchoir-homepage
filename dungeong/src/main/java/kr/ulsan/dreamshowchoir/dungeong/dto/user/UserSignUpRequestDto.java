package kr.ulsan.dreamshowchoir.dungeong.dto.user;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class UserSignUpRequestDto {

    @NotBlank(message = "이름을 입력해주세요.")
    private String name;

    @NotBlank(message = "휴대폰 번호를 입력해주세요.")
    // 정규식: 010-1234-5678 또는 01012345678 형식 허용
    @Pattern(regexp = "^01(?:0|1|[6-9])[.-]?(\\d{3}|\\d{4})[.-]?(\\d{4})$", message = "올바른 휴대폰 번호 형식이 아닙니다.")
    private String phoneNumber;

    @NotNull(message = "생년월일을 입력해주세요.")
    private LocalDate birthDate; // JSON 예시: "1990-01-01"

    @NotBlank(message = "성별을 선택해주세요.")
    private String gender; // "MALE" or "FEMALE"

    @AssertTrue(message = "이용 약관에 동의해야 합니다.")
    @NotNull(message = "약관 동의 여부는 필수입니다.")
    private Boolean termsAgreed;
}