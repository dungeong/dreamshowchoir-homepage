package kr.ulsan.dreamshowchoir.dungeong.domain.info.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.info.History;
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
@Import(JpaAuditingConfig.class) // Auditing 기능(createdAt) 활성화
class HistoryRepositoryTest {

    @Autowired
    private HistoryRepository historyRepository;

    @Test
    @DisplayName("새로운 History를 저장하고 ID로 조회하면 성공")
    void saveAndFindHistoryTest() {
        // given (준비)
        History newHistory = History.builder()
                .year(2024)
                .content("드림쇼콰이어 창단")
                .build();

        // when (실행)
        History savedHistory = historyRepository.save(newHistory);

        // then (검증)
        History foundHistory = historyRepository.findById(savedHistory.getHistoryId()).orElseThrow();

        assertThat(foundHistory.getHistoryId()).isEqualTo(savedHistory.getHistoryId());
        assertThat(foundHistory.getYear()).isEqualTo(2024);
        assertThat(foundHistory.getContent()).isEqualTo("드림쇼콰이어 창단");
        assertThat(foundHistory.getCreatedAt()).isNotNull(); // Auditing 검증
    }

    @Test
    @DisplayName("연혁 목록을 연도(year) 오름차순으로 조회함")
    void findAllByOrderByYearAscTest() {
        // given (준비)
        // 1. 2025년 (나중)
        History history2025 = historyRepository.saveAndFlush(History.builder()
                .year(2025)
                .month(11)
                .content("제 1회 정기연주회")
                .build());

        // 2. 2024년 (먼저)
        History history2024 = historyRepository.saveAndFlush(History.builder()
                .year(2024)
                .month(12)
                .content("창단")
                .build());

        // when (실행)
        List<History> histories = historyRepository.findAllByOrderByYearAscMonthAsc();

        // then (검증)
        assertThat(histories).hasSize(2);
        // 연도(Year) 오름차순(ASC) 정렬 검증 (2024년이 먼저)
        assertThat(histories.get(0).getHistoryId()).isEqualTo(history2024.getHistoryId());
        assertThat(histories.get(0).getYear()).isEqualTo(2024);
        assertThat(histories.get(1).getHistoryId()).isEqualTo(history2025.getHistoryId());
    }

    @Test
    @DisplayName("연혁 내용을 수정(update)할 수 있음")
    void updateContentTest() {
        // given (준비)
        History history = historyRepository.save(History.builder()
                .year(2024)
                .month(12)
                .content("최초 창단")
                .build());
        Long historyId = history.getHistoryId();

        // when (실행)
        History foundHistory = historyRepository.findById(historyId).orElseThrow();
        foundHistory.update(2024, 12, "드림쇼콰이어 공식 창단"); // 엔티티 편의 메소드 사용
        historyRepository.saveAndFlush(foundHistory); // 변경사항 DB 반영

        // then (검증)
        History updatedHistory = historyRepository.findById(historyId).orElseThrow();
        assertThat(updatedHistory.getContent()).isEqualTo("드림쇼콰이어 공식 창단");
    }
}