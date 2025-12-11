package kr.ulsan.dreamshowchoir.dungeong.domain.post.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.Post;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.PostImage;
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

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // PostgreSQL 사용
@Import(JpaAuditingConfig.class) // Auditing 기능(createdAt) 활성화
class PostImageRepositoryTest {

    @Autowired
    private PostImageRepository postImageRepository;

    @Autowired
    private PostRepository postRepository; // PostImage는 Post에 의존

    @Autowired
    private UserRepository userRepository; // Post는 User에 의존

    private User savedTestUser;
    private Post savedTestPost;

    @BeforeEach
    void setUp() {
        // User 저장
        User testUser = User.builder()
                .name("이미지업로더")
                .email("image@example.com")
                .oauthProvider("google")
                .oauthId("google_image_123")
                .role(Role.USER)
                .build();
        savedTestUser = userRepository.saveAndFlush(testUser);

        // Post 저장
        Post testPost = Post.builder()
                .user(savedTestUser)
                .title("이미지 테스트 게시글")
                .content("이미지 테스트용")
                .build();
        savedTestPost = postRepository.saveAndFlush(testPost);
    }

    @Test
    @DisplayName("새로운 PostImage를 저장하고 ID로 조회하면 성공한다.")
    void saveAndFindPostImageTest() {
        // given (준비)
        PostImage newImage = PostImage.builder()
                .post(savedTestPost) // @BeforeEach에서 저장한 Post
                .imageKey("s3-post-image-key-1.png")
                .imageName("첨부파일1.png")
                .fileSize(512L)
                .build();

        // when (실행)
        PostImage savedImage = postImageRepository.save(newImage);

        // then (검증)
        PostImage foundImage = postImageRepository.findById(savedImage.getImageId()).orElseThrow();

        assertThat(foundImage.getImageId()).isEqualTo(savedImage.getImageId());
        assertThat(foundImage.getImageName()).isEqualTo("첨부파일1.png");
        assertThat(foundImage.getImageKey()).isEqualTo("s3-post-image-key-1.png");
        assertThat(foundImage.getFileSize()).isEqualTo(512L);
        assertThat(foundImage.getPost().getTitle()).isEqualTo("이미지 테스트 게시글"); // 연관관계 조회
        assertThat(foundImage.getCreatedAt()).isNotNull(); // Auditing 검증
    }
}