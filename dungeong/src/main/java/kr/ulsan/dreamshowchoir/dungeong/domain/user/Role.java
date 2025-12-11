package kr.ulsan.dreamshowchoir.dungeong.domain.user;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {

    GUEST("ROLE_GUEST", "손님"),      // 추가 정보 입력 전
    USER("ROLE_USER", "일반 사용자"),
    MEMBER("ROLE_MEMBER", "합창 단원"),
    ADMIN("ROLE_ADMIN", "관리자");

    private final String key;
    private final String title;

}
