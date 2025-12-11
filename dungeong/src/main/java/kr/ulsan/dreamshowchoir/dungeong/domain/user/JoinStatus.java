package kr.ulsan.dreamshowchoir.dungeong.domain.user;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum JoinStatus {
    PENDING("PENDING", "대기 중"),
    APPROVED("APPROVED", "승인됨"),
    REJECTED("REJECTED", "거절됨");

    private final String key;
    private final String title;
}