package kr.ulsan.dreamshowchoir.dungeong.domain.banner.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.banner.Banner;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // PostgreSQL 사용
@Import(JpaAuditingConfig.class) // Auditing 기능(BaseTimeEntity) 활성화
class BannerRepositoryTest {

    @Autowired
    private BannerRepository bannerRepository;

    // Banner는 User에 의존하지 않으므로 UserRepository가 필요 없음

    @Test
    @DisplayName("새로운 Banner를 저장하고 ID로 조회하면 성공")
    void saveAndFindBannerTest() {
        // given (준비)
        Banner newBanner = Banner.builder()
                .imageKey("s3-banner-key-1.jpg")
                .imageName("banner1.jpg")
                .title("배너 제목 1")
                .description("배너 설명")
                .isActive(true)
                .orderIndex(1) // Flyway V4에서 추가한 orderIndex
                .build();

        // when (실행)
        Banner savedBanner = bannerRepository.save(newBanner);

        // then (검증)
        Banner foundBanner = bannerRepository.findById(savedBanner.getBannerId()).orElseThrow();

        assertThat(foundBanner.getBannerId()).isEqualTo(savedBanner.getBannerId());
        assertThat(foundBanner.getTitle()).isEqualTo("배너 제목 1");
        assertThat(foundBanner.getIsActive()).isTrue();
        assertThat(foundBanner.getOrderIndex()).isEqualTo(1);
        assertThat(foundBanner.getCreatedAt()).isNotNull(); // BaseTimeEntity 검증
    }

    @Test
    @DisplayName("활성화된(isActive=true) 배너만 순서(orderIndex)대로 조회함")
    void findAllByIsActiveTrueAndDeletedAtIsNullOrderByOrderIndexAscTest() {
        // given (준비)
        // 순서 2번 (활성화)
        Banner banner2 = bannerRepository.saveAndFlush(Banner.builder()
                .imageKey("key2")
                .imageName("banner2.jpg")
                .title("배너 2")
                .isActive(true)
                .orderIndex(2)
                .build());

        // 순서 1번 (활성화)
        Banner banner1 = bannerRepository.saveAndFlush(Banner.builder()
                .imageKey("key1")
                .imageName("banner1.jpg")
                .title("배너 1")
                .isActive(true)
                .orderIndex(1)
                .build());

        // 순서 3번 (비활성화)
        bannerRepository.saveAndFlush(Banner.builder()
                .imageKey("key3")
                .imageName("banner3.jpg")
                .title("배너 3 (비활성)")
                .isActive(false) // 비활성화
                .orderIndex(3)
                .build());

        // when (실행)
        List<Banner> activeBanners = bannerRepository.findAllByIsActiveTrueOrderByOrderIndexAsc();

        // then (검증)
        assertThat(activeBanners).hasSize(2); // 활성화된 배너 2개만 조회
        // orderIndex 오름차순(ASC) 정렬 검증 (banner1이 먼저)
        assertThat(activeBanners.get(0).getBannerId()).isEqualTo(banner1.getBannerId());
        assertThat(activeBanners.get(0).getTitle()).isEqualTo("배너 1");
        assertThat(activeBanners.get(1).getBannerId()).isEqualTo(banner2.getBannerId());
    }

    @Test
    @DisplayName("Banner를 논리 삭제하면 조회되지 않아야 함")
    void softDeleteTest() {
        // given (준비)
        Banner newBanner = Banner.builder()
                .imageKey("key_delete")
                .imageName("delete.jpg")
                .title("삭제될 배너")
                .isActive(true)
                .orderIndex(99)
                .build();
        Banner savedBanner = bannerRepository.save(newBanner);
        Long bannerId = savedBanner.getBannerId();

        // when (실행)
        bannerRepository.delete(savedBanner);
        bannerRepository.flush(); // DB 즉시 반영

        // then (검증)
        // @Where(clause = "\"DELETED_AT\" IS NULL") 때문에 조회되면 안 됨
        assertThat(bannerRepository.findById(bannerId)).isEmpty();

        // (추가 검증) 비활성화된 배너 조회 쿼리에도 포함되면 안 됨
        List<Banner> activeBanners = bannerRepository.findAllByIsActiveTrueOrderByOrderIndexAsc();
        assertThat(activeBanners).noneMatch(banner -> banner.getBannerId().equals(bannerId));
    }
}