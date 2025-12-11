package kr.ulsan.dreamshowchoir.dungeong.domain.banner.repository;

import kr.ulsan.dreamshowchoir.dungeong.domain.banner.Banner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {
    // 활성화된 배너 목록 조회
    List<Banner> findAllByIsActiveTrueOrderByOrderIndexAsc();

    // 전체 배너 목록 조회
    List<Banner> findAllByOrderByOrderIndexAsc();
}
