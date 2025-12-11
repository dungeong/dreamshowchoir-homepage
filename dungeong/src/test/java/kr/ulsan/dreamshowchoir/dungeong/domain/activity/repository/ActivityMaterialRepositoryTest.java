package kr.ulsan.dreamshowchoir.dungeong.domain.activity.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.activity.ActivityMaterial;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // PostgreSQL 사용
@Import(JpaAuditingConfig.class) // Auditing 기능(BaseTimeEntity) 활성화
class ActivityMaterialRepositoryTest {

    @Autowired
    private ActivityMaterialRepository activityMaterialRepository;

    @Autowired
    private UserRepository userRepository; // ActivityMaterial은 User에 의존

    private User savedTestUser; // 자료 업로더

    @BeforeEach
    void setUp() {
        // User 저장
        User testUser = User.builder()
                .name("관리자")
                .email("admin@example.com")
                .oauthProvider("google")
                .oauthId("google_admin_123")
                .role(Role.ADMIN)
                .build();
        savedTestUser = userRepository.saveAndFlush(testUser);
    }

    @Test
    @DisplayName("새로운 ActivityMaterial을 저장하고 ID로 조회하면 성공")
    void saveAndFindMaterialTest() {
        // given (준비)
        ActivityMaterial newMaterial = ActivityMaterial.builder()
                .user(savedTestUser)
                .title("2025년 활동 보고서")
                .description("상반기 활동 보고서입니다.")
                .fileKey("s3-material-key-123.pdf")
                .fileName("report.pdf")
                .fileSize(5120L) // V2에서 추가한 fileSize
                .build();

        // when (실행)
        ActivityMaterial savedMaterial = activityMaterialRepository.save(newMaterial);

        // then (검증)
        ActivityMaterial foundMaterial = activityMaterialRepository.findById(savedMaterial.getMaterialId()).orElseThrow();

        assertThat(foundMaterial.getMaterialId()).isEqualTo(savedMaterial.getMaterialId());
        assertThat(foundMaterial.getTitle()).isEqualTo("2025년 활동 보고서");
        assertThat(foundMaterial.getFileSize()).isEqualTo(5120L);
        assertThat(foundMaterial.getUser().getRole()).isEqualTo(Role.ADMIN); // 권한 확인
        assertThat(foundMaterial.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("findAllByOrderByCreatedAtDesc 페이징 쿼리가 정상 동작함")
    void findAllPagingTest() {
        // given (준비) - 2개의 자료 저장
        activityMaterialRepository.save(ActivityMaterial.builder()
                .user(savedTestUser)
                .title("자료 1")
                .fileKey("key1")
                .fileName("file1.pdf")
                .build());

        ActivityMaterial material2 = activityMaterialRepository.save(ActivityMaterial.builder()
                .user(savedTestUser)
                .title("자료 2")
                .fileKey("key2")
                .fileName("file2.pdf")
                .build());

        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));

        // when (실행)
        Page<ActivityMaterial> materialPage = activityMaterialRepository.findAll(pageRequest);

        // then (검증)
        assertThat(materialPage.getTotalElements()).isEqualTo(2);
        assertThat(materialPage.getContent().size()).isEqualTo(2);
        assertThat(materialPage.getContent().get(0).getMaterialId()).isEqualTo(material2.getMaterialId()); // 최신순 정렬 검증
    }

    @Test
    @DisplayName("ActivityMaterial을 논리 삭제하면 조회되지 않아야 함")
    void softDeleteTest() {
        // given (준비)
        ActivityMaterial newMaterial = ActivityMaterial.builder()
                .user(savedTestUser)
                .title("삭제될 자료")
                .fileKey("key_delete")
                .fileName("delete.pdf")
                .build();
        ActivityMaterial savedMaterial = activityMaterialRepository.save(newMaterial);
        Long materialId = savedMaterial.getMaterialId();

        // when (실행)
        activityMaterialRepository.delete(savedMaterial);
        activityMaterialRepository.flush(); // DB 즉시 반영

        // then (검증)
        // @Where(clause = "\"DELETED_AT\" IS NULL") 때문에 조회되면 안 됨
        assertThat(activityMaterialRepository.findById(materialId)).isEmpty();
    }
}