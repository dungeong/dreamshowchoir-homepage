package kr.ulsan.dreamshowchoir.dungeong.domain.user.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.MemberProfile;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // PostgreSQL 사용
@Import(JpaAuditingConfig.class) // (MemberProfile은 Auditing을 안 쓰지만, User가 쓰므로 추가)
class MemberProfileRepositoryTest {

    @Autowired
    private MemberProfileRepository memberProfileRepository;

    @Autowired
    private UserRepository userRepository; // MemberProfile은 User에 의존

    private User savedTestUser; // 프로필의 주인이 될 유저

    @BeforeEach
    void setUp() {
        // User 저장
        User testUser = User.builder()
                .name("단원")
                .email("member@example.com")
                .oauthProvider("google")
                .oauthId("google_member_123")
                .role(Role.MEMBER) // 단원(MEMBER) 역할
                .build();
        savedTestUser = userRepository.saveAndFlush(testUser);
    }

    @Test
    @DisplayName("새로운 MemberProfile을 저장하고 User의 ID로 조회하면 성공")
    void saveAndFindMemberProfileTest() {   // 단방향
        // given (준비)
        MemberProfile newProfile = MemberProfile.builder()
                .user(savedTestUser) // @BeforeEach에서 저장한 User 객체를 전달
                .part("테너")
                .interests("코딩, 노래")
                .myDream("훌륭한 개발자")
                .hashTags("#열정")
                .isPublic(true)
                .build();

        // when (실행)
        MemberProfile savedProfile = memberProfileRepository.save(newProfile);

        // then (검증)
        // MemberProfile의 ID는 User의 ID와 동일해야 함 (@MapsId)
        assertThat(savedProfile.getUserId()).isEqualTo(savedTestUser.getUserId());

        // User의 ID로 MemberProfile을 조회
        MemberProfile foundProfile = memberProfileRepository.findById(savedTestUser.getUserId()).orElseThrow();

        assertThat(foundProfile.getUserId()).isEqualTo(savedTestUser.getUserId());
        assertThat(foundProfile.getPart()).isEqualTo("테너");
        assertThat(foundProfile.getInterests()).isEqualTo("코딩, 노래");
        assertThat(foundProfile.getUser().getName()).isEqualTo("단원"); // 연관관계 조회
    }

    @Test
    @DisplayName("User를 저장할 때 MemberProfile이 CascadeType.ALL로 함께 저장된다.")
    void cascadeSaveTest() {
        // given (준비)
        // User와 MemberProfile을 동시에 생성
        User userWithProfile = User.builder()
                .name("새 단원")
                .email("new@example.com")
                .oauthProvider("kakao")
                .oauthId("kakao_123")
                .role(Role.MEMBER)
                .build();

        MemberProfile newProfile = MemberProfile.builder()
                .user(userWithProfile) // User 객체 주입
                .part("베이스")
                .isPublic(true)
                .build();

        // User -> Profile 관계 설정 (양방향)
        userWithProfile.setMemberProfile(newProfile);

        // when (실행)
        // User만 저장 (MemberProfile은 저장 안 함)
        User savedUser = userRepository.save(userWithProfile);

        // then (검증)
        // User가 저장되었는지 확인
        assertThat(savedUser.getUserId()).isNotNull();
        assertThat(savedUser.getMemberProfile()).isNotNull();

        MemberProfile foundProfile = memberProfileRepository.findById(savedUser.getUserId()).orElseThrow();
        assertThat(foundProfile).isNotNull();
        assertThat(foundProfile.getPart()).isEqualTo("베이스");
    }
}