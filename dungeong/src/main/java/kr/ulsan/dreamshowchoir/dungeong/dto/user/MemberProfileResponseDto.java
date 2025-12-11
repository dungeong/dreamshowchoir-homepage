package kr.ulsan.dreamshowchoir.dungeong.dto.user;

import kr.ulsan.dreamshowchoir.dungeong.domain.user.MemberProfile;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.Getter;

@Getter
public class MemberProfileResponseDto {

    private final String name;          // 이름 (User에서 가져옴)
    private final String part;          // 파트 (SOPRANO 등)
    private final String interests;     // 관심사
    private final String myDream;       // 나의 꿈
    private final String hashTags;      // 해시태그
    private final String profileImageUrl; // 프로필 이미지 URL

    public MemberProfileResponseDto(MemberProfile profile) {
        User user = profile.getUser();

        this.name = user.getName();
        this.part = profile.getPart();
        this.interests = profile.getInterests();
        this.myDream = profile.getMyDream();
        this.hashTags = profile.getHashTags();

        // 프로필 이미지는 MemberProfile의 것이 있으면 쓰고, 없으면 User의 기본 이미지를 씀 (우선순위 로직)
        if (profile.getProfileImageKey() != null && !profile.getProfileImageKey().isEmpty()) {
            this.profileImageUrl = profile.getProfileImageKey();
        } else {
            this.profileImageUrl = user.getProfileImageKey();
        }
    }
}