package kr.ulsan.dreamshowchoir.dungeong.domain.gallery.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.gallery.Gallery;
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

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // PostgreSQL 사용
@Import(JpaAuditingConfig.class) // Auditing 기능 활성화
class GalleryRepositoryTest {

    @Autowired
    private GalleryRepository galleryRepository;

    @Autowired
    private UserRepository userRepository; // Gallery는 User에 의존

    private User savedTestUser; // 갤러리 업로더

    @BeforeEach
    void setUp() {
        // 갤러리 업로더(User) 저장
        User testUser = User.builder()
                .name("갤러리담당자")
                .email("gallery@example.com")
                .oauthProvider("google")
                .oauthId("google_gallery_123")
                .role(Role.MEMBER)
                .termsAgreed(true)
                .build();
        savedTestUser = userRepository.saveAndFlush(testUser);
    }

    @Test
    @DisplayName("새로운 Gallery를 저장하고 ID로 조회하면 성공")
    void saveAndFindGalleryTest() {
        // given (준비)
        Gallery newGallery = Gallery.builder()
                .user(savedTestUser)
                .type("정기공연")
                .title("2025 정기공연 사진")
                .description("공연 실황입니다.")
                .build();

        // when (실행)
        Gallery savedGallery = galleryRepository.save(newGallery);

        // then (검증)
        Gallery foundGallery = galleryRepository.findById(savedGallery.getGalleryId()).orElseThrow();

        assertThat(foundGallery.getGalleryId()).isEqualTo(savedGallery.getGalleryId());
        assertThat(foundGallery.getTitle()).isEqualTo("2025 정기공연 사진");
        assertThat(foundGallery.getUser().getName()).isEqualTo("갤러리담당자");
        assertThat(foundGallery.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("findAllByDeletedAtIsNull 페이징 쿼리가 정상 동작함")
    void findAllPagingTest() {
        // given (준비) - 2개의 갤러리 저장
        galleryRepository.save(Gallery.builder()
                .user(savedTestUser)
                .type("행사")
                .title("갤러리 1")
                .description("내용 1")
                .build());

        galleryRepository.save(Gallery.builder()
                .user(savedTestUser)
                .type("정기공연")
                .title("갤러리 2")
                .description("내용 2")
                .build());

        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));

        // when (실행)
        Page<Gallery> galleryPage = galleryRepository.findAll(pageRequest);

        // then (검증)
        assertThat(galleryPage.getTotalElements()).isEqualTo(2);
        assertThat(galleryPage.getContent().size()).isEqualTo(2);
        assertThat(galleryPage.getContent().get(0).getTitle()).isEqualTo("갤러리 2"); // 최신순 정렬 검증
    }

    @Test
    @DisplayName("촬영일 내림차순이 분류 필터와 페이지에 적용된다")
    void galleryPageOrdersByNewestTakenDateBeforePaging() {
        galleryRepository.saveAllAndFlush(List.of(
                album("REGULAR", "나중에 촬영", LocalDate.of(2025, 9, 27)),
                album("REGULAR", "촬영일 미지정", null),
                album("IRREGULAR", "수국 페스티벌", LocalDate.of(2025, 6, 14)),
                album("REGULAR", "먼저 촬영", LocalDate.of(2023, 10, 15))
        ));

        Page<Gallery> firstPage = galleryRepository.findGalleryPage(null, PageRequest.of(0, 2));
        assertThat(firstPage.getTotalElements()).isEqualTo(4);
        assertThat(firstPage.getContent()).extracting(Gallery::getTitle)
                .containsExactly("나중에 촬영", "수국 페스티벌");
        assertThat(galleryRepository.findGalleryPage(null, PageRequest.of(1, 2)).getContent())
                .extracting(Gallery::getTitle).containsExactly("먼저 촬영", "촬영일 미지정");
        assertThat(galleryRepository.findGalleryPage("REGULAR", PageRequest.of(0, 3)).getContent())
                .extracting(Gallery::getTitle).containsExactly("나중에 촬영", "먼저 촬영", "촬영일 미지정");
    }

    private Gallery album(String type, String title, LocalDate takenDate) {
        return Gallery.builder().user(savedTestUser).type(type).title(title).takenDate(takenDate).build();
    }

    @Test
    @DisplayName("Gallery를 논리 삭제하면 조회되지 않아야 함")
    void softDeleteTest() {
        // given (준비)
        Gallery newGallery = Gallery.builder()
                .user(savedTestUser)
                .type("정기공연")
                .title("삭제될 갤러리")
                .description("내용")
                .build();
        Gallery savedGallery = galleryRepository.save(newGallery);
        Long galleryId = savedGallery.getGalleryId();

        // when (실행)
        galleryRepository.delete(savedGallery);
        galleryRepository.flush(); // DB 즉시 반영

        // then (검증)
        // @Where(clause = "\"DELETED_AT\" IS NULL") 때문에 조회되면 안 됨
        assertThat(galleryRepository.findById(galleryId)).isEmpty();
    }
}
