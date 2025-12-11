package kr.ulsan.dreamshowchoir.dungeong.dto.donation;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import kr.ulsan.dreamshowchoir.dungeong.domain.donation.Donation;
import kr.ulsan.dreamshowchoir.dungeong.domain.donation.DonationType;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DonationRequestDto {

    @NotNull(message = "후원 금액을 입력해주세요.")
    @Min(value = 1000, message = "최소 후원 금액은 1,000원입니다.")
    private Long amount;

    @NotNull(message = "후원 타입을 선택해주세요. (REGULAR or ONE_TIME)")
    private DonationType type;

    /**
     * DTO를 Donation 엔티티로 변환하는 편의 메소드
     */
    public Donation toEntity(User user) {
        return Donation.builder()
                .user(user)
                .amount(this.amount)
                .type(this.type)
                // Status는 엔티티의 @Builder.Default("PENDING")가 자동으로 설정
                .build();
    }
}