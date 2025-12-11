package kr.ulsan.dreamshowchoir.dungeong.domain.gallery.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.common.MediaType;
import kr.ulsan.dreamshowchoir.dungeong.domain.gallery.Gallery;
import kr.ulsan.dreamshowchoir.dungeong.domain.gallery.GalleryMedia;
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
class GalleryMediaRepositoryTest {

    @Autowired
    private GalleryMediaRepository galleryMediaRepository;

    @Autowired
    private GalleryRepository galleryRepository; // GalleryMedia는 Gallery에 의존

    @Autowired
    private UserRepository userRepository; // Gallery는 User에 의존

    private User savedTestUser;
    private Gallery savedTestGallery;

    @BeforeEach
    void setUp() {
        // User 저장
        User testUser = User.builder()
                .name("미디어업로더")
                .email("media@example.com")
                .oauthProvider("google")
                .oauthId("google_media_123")
                .role(Role.MEMBER)
                .build();
        savedTestUser = userRepository.saveAndFlush(testUser);

        // Gallery 저장
        Gallery testGallery = Gallery.builder()
                .user(savedTestUser)
                .type("정기공연")
                .title("테스트 갤러리")
                .description("미디어 테스트용")
                .build();
        savedTestGallery = galleryRepository.saveAndFlush(testGallery);
    }

    @Test
    @DisplayName("새로운 GalleryMedia를 저장하고 ID로 조회하면 성공")
    void saveAndFindGalleryMediaTest() {
        // given (준비)
        GalleryMedia newMedia = GalleryMedia.builder()
                .gallery(savedTestGallery) // @BeforeEach에서 저장한 Gallery
                .fileKey("s3-unique-key-12345.jpg")
                .fileName("공연사진1.jpg")
                .mediaType(MediaType.IMAGE) // MediaType Enum 사용
                .fileSize(1024L) // Flyway V2에서 추가한 fileSize
                .build();

        // when (실행)
        GalleryMedia savedMedia = galleryMediaRepository.save(newMedia);

        // then (검증)
        GalleryMedia foundMedia = galleryMediaRepository.findById(savedMedia.getMediaId()).orElseThrow();

        assertThat(foundMedia.getMediaId()).isEqualTo(savedMedia.getMediaId());
        assertThat(foundMedia.getFileName()).isEqualTo("공연사진1.jpg");
        assertThat(foundMedia.getMediaType()).isEqualTo(MediaType.IMAGE);
        assertThat(foundMedia.getFileSize()).isEqualTo(1024L);
        assertThat(foundMedia.getGallery().getTitle()).isEqualTo("테스트 갤러리"); // 연관관계 조회
        assertThat(foundMedia.getCreatedAt()).isNotNull(); // Auditing 검증
    }
}