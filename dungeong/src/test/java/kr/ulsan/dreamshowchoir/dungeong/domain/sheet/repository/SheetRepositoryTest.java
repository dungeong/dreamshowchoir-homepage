package kr.ulsan.dreamshowchoir.dungeong.domain.sheet.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.sheet.Sheet;
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

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // 실제 DB(PostgreSQL) 사용
@Import(JpaAuditingConfig.class) // BaseTimeEntity(Auditing) 활성화
class SheetRepositoryTest {

    @Autowired
    private SheetRepository sheetRepository;

    @Autowired
    private UserRepository userRepository;

    private User savedTestUser;

    @BeforeEach
    void setUp() {
        // 테스트용 유저 생성 및 저장
        User testUser = User.builder()
                .name("자료담당자")
                .email("sheet@example.com")
                .oauthProvider("google")
                .oauthId("google_sheet_123")
                .role(Role.MEMBER)
                .build();
        savedTestUser = userRepository.saveAndFlush(testUser);
    }

    @Test
    @DisplayName("새로운 Sheet를 저장하고 ID로 조회하면 성공한다")
    void saveAndFindSheetTest() {
        // given
        Sheet newSheet = Sheet.builder()
                .user(savedTestUser)
                .fileKey("s3-sheet-key-123.pdf")
                .fileName("꿈꾸지않으면.pdf")
                .fileSize(2048L)
                // isPublic 설정 제거됨
                .build();

        // when
        Sheet savedSheet = sheetRepository.save(newSheet);

        // then
        Sheet foundSheet = sheetRepository.findById(savedSheet.getSheetId()).orElseThrow();

        assertThat(foundSheet.getSheetId()).isEqualTo(savedSheet.getSheetId());
        assertThat(foundSheet.getFileName()).isEqualTo("꿈꾸지않으면.pdf");
        assertThat(foundSheet.getFileSize()).isEqualTo(2048L);
        assertThat(foundSheet.getUser().getName()).isEqualTo("자료담당자");
        assertThat(foundSheet.getCreatedAt()).isNotNull(); // Auditing 동작 확인
    }

    @Test
    @DisplayName("전체 악보 목록을 최신순으로 페이징 조회한다")
    void findAllPagingTest() {
        // given
        // 악보 1 생성
        sheetRepository.save(Sheet.builder()
                .user(savedTestUser)
                .fileKey("key1.pdf")
                .fileName("옛날악보.pdf")
                .fileSize(100L)
                .build());

        // 악보 2 생성 (더 나중에 생성됨)
        sheetRepository.save(Sheet.builder()
                .user(savedTestUser)
                .fileKey("key2.pdf")
                .fileName("최신악보.pdf")
                .fileSize(200L)
                .build());

        // save()만으로는 created_at이 같을 수도 있으므로 flush 처리하거나 약간의 텀이 필요할 수 있으나,
        // DataJpaTest 환경에서는 순차 실행되므로 보통 ID 순서 = 시간 순서로 간주 가능.
        sheetRepository.flush();

        // 페이지 요청: 0페이지, 10개씩, 생성일 내림차순(DESC)
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));

        // when
        // 사용자 정의 메서드가 아닌 기본 findAll(Pageable) 사용
        Page<Sheet> sheetPage = sheetRepository.findAll(pageRequest);

        // then
        assertThat(sheetPage.getTotalElements()).isEqualTo(2); // 총 2개
        List<Sheet> content = sheetPage.getContent();

        // 최신순 정렬 확인 (ID가 더 큰 '최신악보.pdf'가 먼저 나와야 함)
        assertThat(content.get(0).getFileName()).isEqualTo("최신악보.pdf");
        assertThat(content.get(1).getFileName()).isEqualTo("옛날악보.pdf");
    }

    @Test
    @DisplayName("Sheet를 삭제(Soft Delete)하면 조회되지 않아야 한다")
    void softDeleteTest() {
        // given
        Sheet newSheet = Sheet.builder()
                .user(savedTestUser)
                .fileKey("key_delete.pdf")
                .fileName("삭제될악보.pdf")
                .build();
        Sheet savedSheet = sheetRepository.save(newSheet);
        Long sheetId = savedSheet.getSheetId();

        // when
        sheetRepository.delete(savedSheet);
        sheetRepository.flush(); // 영속성 컨텍스트 반영 (UPDATE 쿼리 실행)

        // then
        // @Where(clause = "\"DELETED_AT\" IS NULL") 어노테이션 덕분에 조회되지 않아야 함
        assertThat(sheetRepository.findById(sheetId)).isEmpty();
    }
}