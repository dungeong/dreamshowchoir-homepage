package kr.ulsan.dreamshowchoir.dungeong.domain.communicate.repository;

import kr.ulsan.dreamshowchoir.dungeong.domain.communicate.Faq;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FaqRepository extends JpaRepository<Faq, Long> {
    // FAQ 목록 전체 조회
    List<Faq> findAllByOrderByCreatedAtDesc();
}
