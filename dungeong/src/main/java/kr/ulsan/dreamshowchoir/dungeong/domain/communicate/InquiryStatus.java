package kr.ulsan.dreamshowchoir.dungeong.domain.communicate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum InquiryStatus {
    PENDING("PENDING", "대기 중"),
    ANSWERED("ANSWERED", "답변 완료");

    private final String key;
    private final String title;
}
