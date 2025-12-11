package kr.ulsan.dreamshowchoir.dungeong.domain.communicate.repository;

import kr.ulsan.dreamshowchoir.dungeong.domain.communicate.Inquiry;
import kr.ulsan.dreamshowchoir.dungeong.domain.communicate.InquiryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    // (관리자용) 특정 상태의 문의 목록 페이징 조회
    Page<Inquiry> findAllByStatusOrderByCreatedAtDesc(InquiryStatus status, Pageable pageable);

    // 상태별 건수 (관리자 메인 대시보드용)
    long countByStatus(InquiryStatus status);
}
