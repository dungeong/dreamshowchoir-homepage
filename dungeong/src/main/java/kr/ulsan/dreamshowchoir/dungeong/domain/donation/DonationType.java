package kr.ulsan.dreamshowchoir.dungeong.domain.donation;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DonationType {
    REGULAR("REGULAR", "정기 후원"),
    ONE_TIME("ONE_TIME", "일시 후원");

    private final String key;
    private final String title;
}
