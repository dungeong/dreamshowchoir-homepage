package kr.ulsan.dreamshowchoir.dungeong.domain.content.repository;

import kr.ulsan.dreamshowchoir.dungeong.domain.content.SiteContent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SiteContentRepository extends JpaRepository<SiteContent, String> {
    // findById(contentKey)는 기본 제공됨
}