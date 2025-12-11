package kr.ulsan.dreamshowchoir.dungeong.dto.user;

import kr.ulsan.dreamshowchoir.dungeong.domain.user.MemberProfile;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class UserResponseDto {

    // User 정보
    private final Long userId;
    private final String email;
    private final String name;
    private final String profileImageKey; // User의 기본 프로필 이미지
    private final Role role; // 사용자 권한 (USER, MEMBER, ADMIN)
    private final String phoneNumber;
    private final LocalDate birthDate;
    private final String gender;
    private final Boolean termsAgreed;

    // MemberProfile 정보 (단원일 경우)
    private String part;
    private String interests;
    private String myDream;
    private String hashTags;
    private String memberProfileImageKey; // 단원 전용 프로필 이미지
    private Boolean isPublic; // 내 프로필 공개 여부

    /**
     * Entity를 DTO로 변환하는 생성자
     *
     * @param user    User 엔티티
     * @param profile MemberProfile 엔티티 (null일 수 있음)
     */
    @Builder
    public UserResponseDto(User user, MemberProfile profile) {
        // User 필수 정보 매핑
        this.userId = user.getUserId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.profileImageKey = user.getProfileImageKey();
        this.role = user.getRole();
        this.phoneNumber = user.getPhoneNumber();
        this.birthDate = user.getBirthDate();
        this.gender = user.getGender();
        this.termsAgreed = user.getTermsAgreed();

        // MemberProfile 정보 매핑
        if (profile != null) {
            this.part = profile.getPart();
            this.interests = profile.getInterests();
            this.myDream = profile.getMyDream();
            this.hashTags = profile.getHashTags();
            this.memberProfileImageKey = profile.getProfileImageKey();
            this.isPublic = profile.getIsPublic();
        }
    }
}