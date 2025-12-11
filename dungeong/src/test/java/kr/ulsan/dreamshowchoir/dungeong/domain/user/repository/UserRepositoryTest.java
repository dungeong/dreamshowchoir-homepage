package kr.ulsan.dreamshowchoir.dungeong.domain.user.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(JpaAuditingConfig.class) // JPA Auditing 기능(createdAt) 활성화
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // H2 DB 대신 PostgreSQL 사용
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("새로운 User를 저장하고 ID로 조회하면 성공")
    void saveAndFindUserTest() {
        // given (준비)
        User newUser = User.builder()
                .name("테스트유저")
                .email("test@example.com")
                .oauthProvider("google")
                .oauthId("google_12345")
                .role(Role.USER)
                .build();

        // when (실행)
        User savedUser = userRepository.save(newUser);
        User foundUser = userRepository.findById(savedUser.getUserId()).orElseThrow();

        // then (검증)
        assertThat(foundUser.getUserId()).isEqualTo(savedUser.getUserId());
        assertThat(foundUser.getEmail()).isEqualTo("test@example.com");
        assertThat(foundUser.getRole()).isEqualTo(Role.USER);

        // BaseTimeEntity의 createdAt이 잘 동작하는지 검증
        assertThat(foundUser.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Email로 User를 조회하면 성공")
    void findByEmailTest() {
        // given (준비)
        User newUser = User.builder()
                .name("테스트유저")
                .email("find@example.com")
                .oauthProvider("kakao")
                .oauthId("kakao_12345")
                .role(Role.USER)
                .build();
        userRepository.save(newUser);

        // when (실행)
        User foundUser = userRepository.findByEmail("find@example.com").orElseThrow();

        // then (검증)
        assertThat(foundUser.getName()).isEqualTo("테스트유저");
        assertThat(foundUser.getOauthProvider()).isEqualTo("kakao");
    }
}
