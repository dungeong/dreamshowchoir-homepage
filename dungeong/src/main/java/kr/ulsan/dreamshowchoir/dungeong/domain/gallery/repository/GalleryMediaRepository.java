package kr.ulsan.dreamshowchoir.dungeong.domain.gallery.repository;

import kr.ulsan.dreamshowchoir.dungeong.domain.gallery.Gallery;
import kr.ulsan.dreamshowchoir.dungeong.domain.gallery.GalleryMedia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface GalleryMediaRepository extends JpaRepository<GalleryMedia, Long> {

    // 특정 갤러리에 속한 모든 미디어 조회
    List<GalleryMedia> findAllByGallery(Gallery gallery);
}