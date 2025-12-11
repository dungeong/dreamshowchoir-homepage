package kr.ulsan.dreamshowchoir.dungeong.domain.user;

import jakarta.persistence.*;
import kr.ulsan.dreamshowchoir.dungeong.domain.common.BaseAuditEntity;
import lombok.*;
import org.hibernate.annotations.DynamicUpdate;

import java.time.LocalDate;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "\"User\"")
@DynamicUpdate // 수정 시 변경된 필드만 update
public class User extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "OAUTH_PROVIDER", nullable = false)
    private String oauthProvider;

    @Column(name = "OAUTH_ID", nullable = false, unique = true)
    private String oauthId;

    @Column(name = "EMAIL", unique = true)
    private String email;

    @Column(name = "NAME", nullable = false)
    private String name;

    @Column(name = "PROFILE_IMAGE_KEY")
    private String profileImageKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE", nullable = false)
    private Role role;

    // 양방향 관계 편의 메소드
    // 1:1 관계매핑
    @Setter
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private MemberProfile memberProfile;

    // ----------- 추가 입력 정보 -----------
    @Column(name = "PHONE_NUMBER", length = 20)
    private String phoneNumber;

    @Column(name = "BIRTH_DATE")
    private LocalDate birthDate; // java.time.LocalDate

    @Column(name = "GENDER", length = 10)
    private String gender; // "MALE", "FEMALE"

    @Column(name = "TERMS_AGREED", nullable = false)
    private Boolean termsAgreed;

    // 생성자
    @Builder
    public User(String oauthProvider, String oauthId, String email, String name, String profileImageKey, Role role,
            Boolean termsAgreed, String phoneNumber, LocalDate birthDate, String gender) {
        this.oauthProvider = oauthProvider;
        this.oauthId = oauthId;
        this.email = email;
        this.name = name;
        this.profileImageKey = profileImageKey;
        this.role = role;
        this.termsAgreed = termsAgreed;
        this.phoneNumber = phoneNumber;
        this.birthDate = birthDate;
        this.gender = gender;
    }

    // OAuth2 로그인 시 기존 회원 정보 업데이트
    public User updateOAuthInfo(String name, String profileImageKey) {
        this.name = name;
        this.profileImageKey = profileImageKey;
        return this;
    }

    // 회원 등급 '단원'으로 승급
    public void approveAsMember() {
        this.role = Role.MEMBER;
    }

    // 추가 정보 업데이트 메소드 (Onboarding)
    public void updateAdditionalInfo(String name, String phoneNumber, LocalDate birthDate, String gender,
            Boolean termsAgreed) {
        this.name = name; // 실명으로 덮어쓰기 (OAuth 이름이 닉네임일 수 있으므로)
        this.phoneNumber = phoneNumber;
        this.birthDate = birthDate;
        this.gender = gender;
        this.termsAgreed = termsAgreed;
    }

    // 내 정보 수정
    public void updateInfo(String name, String phoneNumber, LocalDate birthDate, String gender) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.birthDate = birthDate;
        this.gender = gender;
    }

    // 회원가입 완료
    public void upgradeToUser() {
        this.role = Role.USER;
    }

    // 프로필 이미지 업데이트
    public void updateProfileImage(String profileImageKey) {
        this.profileImageKey = profileImageKey;
    }

    // 회원 권한 변경
    public void updateRole(Role role) {
        this.role = role;
    }
}
