package kr.ulsan.dreamshowchoir.dungeong.domain.user.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.JoinApplication;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.JoinStatus; // Enum import
import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // PostgreSQL 사용
@Import(JpaAuditingConfig.class) // Auditing 기능(createdAt) 활성화
class JoinApplicationRepositoryTest {

    @Autowired
    private JoinApplicationRepository joinApplicationRepository;

    @Autowired
    private UserRepository userRepository; // JoinApplication은 User에 의존

    private User savedTestUser;

    @BeforeEach
    void setUp() {
        // User 저장
        User testUser = User.builder()
                .name("가입신청자")
                .email("join@example.com")
                .oauthProvider("google")
                .oauthId("google_join_123")
                .role(Role.USER)
                .build();
        savedTestUser = userRepository.saveAndFlush(testUser);
    }

    @Test
    @DisplayName("새로운 JoinApplication을 저장하고 ID로 조회하면 성공")
    void saveAndFindJoinApplicationTest() {
        // given (준비)
        JoinApplication newApplication = JoinApplication.builder()
                .user(savedTestUser)
                .part("소프라노")
                .interests("뮤지컬, 여행")
                .myDream("무대에서 노래하기")
                .hashTags("#열정 #긍정")
                .build();

        // when (실행)
        JoinApplication savedApplication = joinApplicationRepository.save(newApplication);

        // then (검증)
        JoinApplication foundApplication = joinApplicationRepository.findById(savedApplication.getJoinId()).orElseThrow();

        assertThat(foundApplication.getJoinId()).isEqualTo(savedApplication.getJoinId());
        assertThat(foundApplication.getPart()).isEqualTo("소프라노");
        assertThat(foundApplication.getHashTags()).isEqualTo("#열정 #긍정");
        assertThat(foundApplication.getStatus()).isEqualTo(JoinStatus.PENDING); // 기본 상태 PENDING 검증
        assertThat(foundApplication.getUser().getName()).isEqualTo("가입신청자"); // 연관관계 조회
        assertThat(foundApplication.getCreatedAt()).isNotNull(); // Auditing 검증
    }

    @Test
    @DisplayName("특정 유저의 신청 이력을 조회함 (findByUser_UserId)")
    void findByUser_UserIdTest() {
        // given (준비)
        JoinApplication newApplication = JoinApplication.builder()
                .user(savedTestUser)
                .part("알토")
                .build();
        joinApplicationRepository.save(newApplication);

        // when (실행)
        JoinApplication foundApplication = joinApplicationRepository.findByUser_UserId(savedTestUser.getUserId()).orElseThrow();

        // then (검증)
        assertThat(foundApplication.getPart()).isEqualTo("알토");
        assertThat(foundApplication.getUser().getUserId()).isEqualTo(savedTestUser.getUserId());
    }

    @Test
    @DisplayName("특정 상태(PENDING)의 신청 목록을 조회함 (findByStatus)")
    void findByStatusTest() {
        // given (준비)
        // PENDING 상태 신청 (savedTestUser)
        joinApplicationRepository.save(JoinApplication.builder().user(savedTestUser).part("테너").build());

        // 다른 유저(user2)의 PENDING 신청
        User user2 = userRepository.saveAndFlush(User.builder()
                .name("신청자2")
                .email("join2@example.com")
                .oauthProvider("kakao")
                .oauthId("kakao_123")
                .role(Role.USER)
                .build());
        joinApplicationRepository.save(JoinApplication.builder().user(user2).part("베이스").build());

        // when (실행)
        Pageable pageable = PageRequest.of(0, 10);
        Page<JoinApplication> pendingApplicationsPage = joinApplicationRepository.findByStatus(JoinStatus.PENDING, pageable);

        // then (검증)
        assertThat(pendingApplicationsPage.getContent()).hasSize(2);
    }

    @Test
    @DisplayName("가입 신청 상태를 (APPROVED)로 변경할 수 있음")
    void updateStatusToApprovedTest() {
        // given (준비)
        JoinApplication application = joinApplicationRepository.save(JoinApplication.builder()
                .user(savedTestUser)
                .part("소프라노")
                .build());
        assertThat(application.getStatus()).isEqualTo(JoinStatus.PENDING);

        // when (실행)
        application.approve(); // 엔티티 편의 메소드 호출
        joinApplicationRepository.saveAndFlush(application);

        // then (검증)
        JoinApplication foundApplication = joinApplicationRepository.findById(application.getJoinId()).orElseThrow();
        assertThat(foundApplication.getStatus()).isEqualTo(JoinStatus.APPROVED);
    }
}