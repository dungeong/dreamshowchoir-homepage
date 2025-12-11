package kr.ulsan.dreamshowchoir.dungeong.domain.user.repository;

import kr.ulsan.dreamshowchoir.dungeong.domain.user.JoinApplication;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.JoinStatus;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JoinApplicationRepository extends JpaRepository<JoinApplication, Long> {
    // 특정 유저의 신청 이력 조회
    Optional<JoinApplication> findByUser_UserId(Long userId);

    // 특정 상태(예 : PENDING)의 신청 목록 조회 (관리자용)
    Page<JoinApplication> findByStatus(JoinStatus status, Pageable pageable);

    // 특정 유저의 신청 내역을 최신순으로 모두 조회 (List 반환)
    List<JoinApplication> findAllByUserOrderByCreatedAtDesc(User user);

    // 상태별 건수 (관리자 메인 대시보드용)
    long countByStatus(JoinStatus status);

}
