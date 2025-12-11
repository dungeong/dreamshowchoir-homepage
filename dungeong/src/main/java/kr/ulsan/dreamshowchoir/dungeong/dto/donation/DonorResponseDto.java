package kr.ulsan.dreamshowchoir.dungeong.dto.donation;

import kr.ulsan.dreamshowchoir.dungeong.domain.donation.Donation;
import kr.ulsan.dreamshowchoir.dungeong.domain.donation.DonationType;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class DonorResponseDto {
    private final String donorName; // 후원자 이름
    private final Long amount;      // 후원 금액
    private final LocalDateTime date; // 후원 날짜
    private final DonationType type;    // 후원 종류

    public DonorResponseDto(Donation donation) {
        // 유저가 있으면 이름을 넣고, 없으면 null을 넣음
        this.donorName = (donation.getUser() != null) ? donation.getUser().getName() : null;
        this.amount = donation.getAmount();
        this.date = donation.getCreatedAt();
        this.type = donation.getType();
    }
}