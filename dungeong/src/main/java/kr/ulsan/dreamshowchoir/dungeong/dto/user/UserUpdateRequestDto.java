package kr.ulsan.dreamshowchoir.dungeong.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class UserUpdateRequestDto {

    @NotBlank(message = "이름을 입력해주세요.")
    private String name;

    @NotBlank(message = "휴대폰 번호를 입력해주세요.")
    @Pattern(regexp = "^01(?:0|1|[6-9])[.-]?(\\d{3}|\\d{4})[.-]?(\\d{4})$", message = "올바른 휴대폰 번호 형식이 아닙니다.")
    private String phoneNumber;

    @NotNull(message = "생년월일을 입력해주세요.")
    private LocalDate birthDate;

    @NotBlank(message = "성별을 선택해주세요.")
    private String gender;

    // MemberProfile 정보 (단원 전용)
    private String part;       // 파트
    private String interests;  // 관심사
    private String myDream;    // 나의 꿈
    private String hashTags;   // 해시태그
}