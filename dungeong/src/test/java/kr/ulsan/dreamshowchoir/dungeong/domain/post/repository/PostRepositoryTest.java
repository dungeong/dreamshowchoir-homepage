package kr.ulsan.dreamshowchoir.dungeong.domain.post.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.Post;
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
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // H2 DB 대신 PostgreSQL 사용
@Import(JpaAuditingConfig.class) // JPA Auditing 기능(createdAt) 활성화
class PostRepositoryTest {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository; // Post는 User에 의존하므로 필요

    private User savedTestUser; // 테스트 간 공유할 저장된 User

    @BeforeEach
    void setUp() {
        // 롤백을 전제로 하므로, 각 테스트 전에 User를 미리 저장
        User testUser = User.builder()
                .name("테스트유저")
                .email("testuser@example.com")
                .oauthProvider("google")
                .oauthId("google_123")
                .role(Role.USER)
                .build();
        // saveAndFlush: DB에 즉시 반영하고, testUser 객체에 ID 등 DB 상태를 동기화
        savedTestUser = userRepository.saveAndFlush(testUser);
    }

    @Test
    @DisplayName("새로운 Post를 저장하고 ID로 조회하면 성공")
    void saveAndFindPostTest() {
        // given (준비)
        Post newPost = Post.builder()
                .user(savedTestUser)
                .title("테스트 게시글")
                .content("테스트 내용입니다.")
                .build();

        // when (실행)
        Post savedPost = postRepository.save(newPost);

        // then (검증)
        // @Where 절이 있으므로 findById로 조회되어야 함
        Post foundPost = postRepository.findById(savedPost.getPostId()).orElseThrow();

        assertThat(foundPost.getPostId()).isEqualTo(savedPost.getPostId());
        assertThat(foundPost.getTitle()).isEqualTo("테스트 게시글");
        assertThat(foundPost.getUser().getName()).isEqualTo("테스트유저"); // 연관관계 조회 검증
        assertThat(foundPost.getCreatedAt()).isNotNull(); // BaseTimeEntity 검증
    }

    @Test
    @DisplayName("findAllWithUser 페이징 쿼리가 정상 동작함")
    void findAllWithUserPagingTest() {
        // given (준비) - 2개의 게시글 저장
        postRepository.save(Post.builder()
                .user(savedTestUser)
                .title("게시글 1")
                .content("내용 1")
                .build());

        postRepository.save(Post.builder()
                .user(savedTestUser)
                .title("게시글 2")
                .content("내용 2")
                .build());

        // PageRequest: 0번째 페이지(첫 페이지), 페이지 당 10개, createdAt 기준 내림차순
        // (Repository의 @Query에 ORDER BY가 이미 있지만, Pageable에도 명시하는 것이 안전)
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));

        // when (실행)
        // @Where 절이 있는 findAllWithUser 쿼리 실행
        Page<Post> postPage = postRepository.findAllWithUser(pageRequest);

        // then (검증)
        assertThat(postPage.getTotalElements()).isEqualTo(2); // 전체 개수 검증
        assertThat(postPage.getContent().size()).isEqualTo(2); // 조회된 데이터 수 검증
        assertThat(postPage.getContent().get(0).getTitle()).isEqualTo("게시글 2"); // 최신순 정렬 검증
    }

    @Test
    @DisplayName("Post를 논리 삭제(@SQLDelete)하면 findById로 조회되지 않아야 함")
    void softDeleteTest() {
        // given (준비)
        Post newPost = Post.builder()
                .user(savedTestUser)
                .title("삭제될 게시글")
                .content("내용")
                .build();
        Post savedPost = postRepository.save(newPost);
        Long postId = savedPost.getPostId();

        // when (실행)
        postRepository.delete(savedPost); // JPA의 delete 실행 -> @SQLDelete (DELETED_AT 업데이트)
        postRepository.flush(); // DB에 즉시 반영

        // then (검증)
        // @Where(clause = "\"DELETED_AT\" IS NULL") 때문에 조회되면 안 됨
        assertThat(postRepository.findById(postId)).isEmpty();
    }
}