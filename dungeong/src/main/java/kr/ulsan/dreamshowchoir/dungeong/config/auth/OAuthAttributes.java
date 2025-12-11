package kr.ulsan.dreamshowchoir.dungeong.config.auth;

import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.Map;

@Getter
public class OAuthAttributes {
    private final Map<String, Object> attributes;
    private final String nameAttributeKey;
    private final String name;
    private final String email;
    private final String profileImageKey;
    private final String oauthId;
    private final String provider;
    private final String phoneNumber;
    private final LocalDate birthDate;
    private final String gender;

    @Builder
    public OAuthAttributes(Map<String, Object> attributes, String nameAttributeKey, String name, String email, String profileImageKey, String oauthId, String provider, String phoneNumber, LocalDate birthDate, String gender) {
        this.attributes = attributes;
        this.nameAttributeKey = nameAttributeKey;
        this.name = name;
        this.email = email;
        this.profileImageKey = profileImageKey;
        this.oauthId = oauthId;
        this.provider = provider;
        this.phoneNumber = phoneNumber;
        this.birthDate = birthDate;
        this.gender = gender;
    }

    // 넘어온 attributes를 보고 Google인지 Kakao인지 판단하여 파싱
    public static OAuthAttributes of(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {

        // Naver
        if ("naver".equals(registrationId)) {
            return ofNaver(userNameAttributeName, attributes);
        }

        // Kakao (기본값)
        return ofKakao(userNameAttributeName, attributes);
    }


    // Naver JSON 파싱 메소드
    private static OAuthAttributes ofNaver(String userNameAttributeName, Map<String, Object> attributes) {
        // "response" 키로 중첩된 Map을 한 번 더 가져와야 함
        Map<String, Object> response = (Map<String, Object>) attributes.get(userNameAttributeName); // userNameAttributeName == "response"

        // 생일 파싱
        LocalDate birthDate = null;
        if (response.get("birthyear") != null && response.get("birthday") != null) {
            String year = (String) response.get("birthyear");
            String day = (String) response.get("birthday");
            birthDate = LocalDate.parse(year + "-" + day); // "1999-10-12"
        }

        // 성별 변환
        String gender = null;
        if (response.get("gender") != null) {
            String naverGender = (String) response.get("gender");
            gender = "M".equals(naverGender) ? "MALE" : "FEMALE";
        }

        // 전화번호
        String phoneNumber = (String) response.get("mobile");

        return OAuthAttributes.builder()
                .name((String) response.get("name"))
                .email((String) response.get("email"))
                .profileImageKey((String) response.get("profile_image"))
                .oauthId((String) response.get("id")) // 네이버 고유 ID
                .provider("naver")
                .attributes(attributes)
                .nameAttributeKey(userNameAttributeName) // "response"
                .phoneNumber(phoneNumber)
                .birthDate(birthDate)
                .gender(gender)
                .build();
    }

    // 카카오 파싱 메소드
    private static OAuthAttributes ofKakao(String userNameAttributeName, Map<String, Object> attributes) {
        // "kakao_account" Map
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");

        String nickname = null;
        String profileImageUrl = null;
        String email = null;

        // 전화번호 처리
        String phoneNumber = (String) kakaoAccount.get("phone_number");
        if (phoneNumber != null && phoneNumber.startsWith("+82 ")) {
            phoneNumber = "0" + phoneNumber.substring(4);
        }

        // 생일 처리 (birthyear: "2002", birthday: "1130" -> LocalDate)
        LocalDate birthDate = null;
        if (kakaoAccount.get("birthyear") != null && kakaoAccount.get("birthday") != null) {
            String year = (String) kakaoAccount.get("birthyear");
            String birthday = (String) kakaoAccount.get("birthday"); // "1130" (MMDD)
            String month = birthday.substring(0, 2);
            String day = birthday.substring(2);
            birthDate = LocalDate.parse(year + "-" + month + "-" + day);
        }

        // 성별 처리 ("female" / "male" -> "FEMALE" / "MALE")
        String gender = null;
        if (kakaoAccount.get("gender") != null) {
            String kakaoGender = (String) kakaoAccount.get("gender");
            gender = kakaoGender.equalsIgnoreCase("male") ? "MALE" : "FEMALE";
        }

        // 프로필 정보 (선택 동의)
        if (kakaoAccount.containsKey("profile")) {
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
            nickname = (String) profile.get("nickname");
            profileImageUrl = (String) profile.get("profile_image_url");
        }

        // 이메일 정보 (선택 동의)
        if (kakaoAccount.containsKey("email")) {
            email = (String) kakaoAccount.get("email");
        }

        return OAuthAttributes.builder()
                .name(nickname)
                .email(email)
                .profileImageKey(profileImageUrl)
                .oauthId(String.valueOf(attributes.get(userNameAttributeName))) // "id"
                .provider("kakao")
                .attributes(attributes)
                .nameAttributeKey(userNameAttributeName)
                .phoneNumber(phoneNumber)
                .birthDate(birthDate)
                .gender(gender)
                .build();
    }


    // AuthService가 사용할 User 엔티티 생성
    // (이 DTO는 AuthService에 의존하지 않도록 만듦)
    public User toEntity() {
        return User.builder()
                .name(name)
                .email(email)
                .profileImageKey(profileImageKey)
                .oauthId(oauthId)
                .oauthProvider(provider)
                .role(Role.USER) // 가입 시 기본 권한
                .build();
    }
}