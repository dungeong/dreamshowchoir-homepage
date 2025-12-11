package kr.ulsan.dreamshowchoir.dungeong.domain.notice.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.notice.Notice;
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
@Import(JpaAuditingConfig.class) // Auditing 기능 활성화
class NoticeRepositoryTest {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private UserRepository userRepository; // Notice는 User에 의존

    private User savedTestAdmin;

    @BeforeEach
    void setUp() {
        // 공지사항 작성자(Admin) 저장
        User testAdmin = User.builder()
                .name("관리자")
                .email("admin@example.com")
                .oauthProvider("google")
                .oauthId("google_admin_123")
                .role(Role.ADMIN) // 역할을 ADMIN으로 설정
                .build();
        savedTestAdmin = userRepository.saveAndFlush(testAdmin);
    }

    @Test
    @DisplayName("새로운 Notice를 저장하고 ID로 조회하면 성공")
    void saveAndFindNoticeTest() {
        // given (준비)
        Notice newNotice = Notice.builder()
                .user(savedTestAdmin)
                .title("테스트 공지사항")
                .content("공지사항 내용입니다.")
                .build();

        // when (실행)
        Notice savedNotice = noticeRepository.save(newNotice);

        // then (검증)
        Notice foundNotice = noticeRepository.findById(savedNotice.getNoticeId()).orElseThrow();

        assertThat(foundNotice.getNoticeId()).isEqualTo(savedNotice.getNoticeId());
        assertThat(foundNotice.getTitle()).isEqualTo("테스트 공지사항");
        assertThat(foundNotice.getUser().getName()).isEqualTo("관리자");
        assertThat(foundNotice.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("findAllWithUser 페이징 쿼리가 정상 동작함")
    void findAllWithUserPagingTest() {
        // given (준비) - 2개의 공지 저장
        noticeRepository.save(Notice.builder()
                .user(savedTestAdmin)
                .title("공지 1")
                .content("내용 1")
                .build());

        noticeRepository.save(Notice.builder()
                .user(savedTestAdmin)
                .title("공지 2")
                .content("내용 2")
                .build());

        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));

        // when (실행)
        Page<Notice> noticePage = noticeRepository.findAllWithUser(pageRequest);

        // then (검증)
        assertThat(noticePage.getTotalElements()).isEqualTo(2);
        assertThat(noticePage.getContent().size()).isEqualTo(2);
        assertThat(noticePage.getContent().get(0).getTitle()).isEqualTo("공지 2"); // 최신순 정렬 검증
    }

    @Test
    @DisplayName("Notice를 논리 삭제하면 조회되지 않아야 함")
    void softDeleteTest() {
        // given (준비)
        Notice newNotice = Notice.builder()
                .user(savedTestAdmin)
                .title("삭제될 공지")
                .content("내용")
                .build();
        Notice savedNotice = noticeRepository.save(newNotice);
        Long noticeId = savedNotice.getNoticeId();

        // when (실행)
        noticeRepository.delete(savedNotice);
        noticeRepository.flush(); // DB 즉시 반영

        // then (검증)
        // @Where(clause = "\"DELETED_AT\" IS NULL") 때문에 조회되면 안 됨
        assertThat(noticeRepository.findById(noticeId)).isEmpty();
    }
}