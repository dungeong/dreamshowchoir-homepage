package kr.ulsan.dreamshowchoir.dungeong.domain.info.repository;

import kr.ulsan.dreamshowchoir.dungeong.domain.info.History;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoryRepository extends JpaRepository<History, Long> {
    // 연혁 목록 조회 (연도, 월 오름차순)
    List<History> findAllByOrderByYearAscMonthAsc();
}
