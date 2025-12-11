package kr.ulsan.dreamshowchoir.dungeong.domain.donation;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DonationStatus {
    PENDING("PENDING", "대기 중"),
    COMPLETED("COMPLETED", "완료"),
    FAILED("FAILED", "실패");

    private final String key;
    private final String title;
}
