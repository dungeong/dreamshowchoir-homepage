package kr.ulsan.dreamshowchoir.dungeong.domain.post.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.Comment;
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

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(JpaAuditingConfig.class)
class CommentRepositoryTest {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository; // Comment는 Post에 의존

    @Autowired
    private UserRepository userRepository; // Comment는 User에 의존

    private User savedTestUser;
    private Post savedTestPost;

    @BeforeEach
    void setUp() {
        // 댓글 작성자(User) 저장
        User testUser = User.builder()
                .name("댓글작성자")
                .email("commenter@example.com")
                .oauthProvider("google")
                .oauthId("google_123")
                .role(Role.USER)
                .build();
        savedTestUser = userRepository.saveAndFlush(testUser);

        // 댓글이 달릴 게시글(Post) 저장
        Post testPost = Post.builder()
                .user(savedTestUser) // 편의상 게시글 작성자도 동일인으로 설정
                .title("테스트 게시글")
                .content("댓글 테스트용")
                .build();
        savedTestPost = postRepository.saveAndFlush(testPost);
    }

    @Test
    @DisplayName("새로운 Comment를 저장하고 ID로 조회하면 성공")
    void saveAndFindCommentTest() {
        // given (준비)
        Comment newComment = Comment.builder()
                .post(savedTestPost)
                .user(savedTestUser)
                .content("첫 번째 댓글입니다.")
                .build();

        // when (실행)
        Comment savedComment = commentRepository.save(newComment);

        // then (검증)
        Comment foundComment = commentRepository.findById(savedComment.getCommentId()).orElseThrow();

        assertThat(foundComment.getCommentId()).isEqualTo(savedComment.getCommentId());
        assertThat(foundComment.getContent()).isEqualTo("첫 번째 댓글입니다.");
        assertThat(foundComment.getUser().getName()).isEqualTo("댓글작성자");
        assertThat(foundComment.getPost().getTitle()).isEqualTo("테스트 게시글");
        assertThat(foundComment.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("findAllByPostIdWithUser 쿼리가 정상 동작함")
    void findAllByPostIdTest() {
        // given (준비) - 2개의 댓글 저장
        commentRepository.save(Comment.builder()
                .post(savedTestPost)
                .user(savedTestUser)
                .content("댓글 1")
                .build());

        commentRepository.save(Comment.builder()
                .post(savedTestPost)
                .user(savedTestUser)
                .content("댓글 2")
                .build());

        // when (실행)
        List<Comment> comments = commentRepository.findAllByPostIdWithUser(savedTestPost.getPostId());

        // then (검증)
        assertThat(comments).hasSize(2);
        assertThat(comments.get(0).getContent()).isEqualTo("댓글 1"); // createdAt 오름차순(ASC) 정렬 검증
        assertThat(comments.get(1).getContent()).isEqualTo("댓글 2");
    }

    @Test
    @DisplayName("Comment를 논리 삭제하면 조회되지 않아야 함")
    void softDeleteTest() {
        // given (준비)
        Comment newComment = Comment.builder()
                .post(savedTestPost)
                .user(savedTestUser)
                .content("삭제될 댓글")
                .build();
        Comment savedComment = commentRepository.save(newComment);
        Long commentId = savedComment.getCommentId();

        // when (실행)
        commentRepository.delete(savedComment);
        commentRepository.flush(); // DB 즉시 반영

        // then (검증)
        // @Where(clause = "\"DELETED_AT\" IS NULL") 때문에 조회되면 안 됨
        assertThat(commentRepository.findById(commentId)).isEmpty();
    }
}