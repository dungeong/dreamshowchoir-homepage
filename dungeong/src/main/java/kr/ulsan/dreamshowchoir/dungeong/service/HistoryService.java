package kr.ulsan.dreamshowchoir.dungeong.service;

import jakarta.persistence.EntityNotFoundException;
import kr.ulsan.dreamshowchoir.dungeong.domain.info.History;
import kr.ulsan.dreamshowchoir.dungeong.domain.info.repository.HistoryRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.history.HistoryCreateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.history.HistoryResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.history.HistoryUpdateRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class HistoryService {

    private final HistoryRepository historyRepository;

    /**
     * 연혁 생성 (ADMIN 전용)
     */
    public HistoryResponseDto createHistory(HistoryCreateRequestDto requestDto) {
        History newHistory = requestDto.toEntity();
        History savedHistory = historyRepository.save(newHistory);
        return new HistoryResponseDto(savedHistory);
    }

    /**
     * 연혁 조회 (전체 공개)
     */
    @Transactional(readOnly = true)
    public List<HistoryResponseDto> getHistoryList() {
        // Repository에서 연도, 월을 오름차순으로 정렬하여 조회
        List<History> histories = historyRepository.findAllByOrderByYearAscMonthAsc();

        // List<History> -> List<HistoryResponseDto> 변환
        return histories.stream()
                .map(HistoryResponseDto::new)
                .collect(Collectors.toList());
    }

    /**
     * 연혁 수정 (ADMIN 전용)
     */
    public HistoryResponseDto updateHistory(Long historyId, HistoryUpdateRequestDto requestDto) {
        History history = historyRepository.findById(historyId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 연혁을 찾을 수 없습니다: " + historyId));

        // 엔티티 헬퍼 메소드로 수정
        history.update(requestDto.getYear(), requestDto.getMonth(), requestDto.getContent());

        return new HistoryResponseDto(history);
    }

    /**
     * 연혁 삭제 (ADMIN 전용)
     */
    public void deleteHistory(Long historyId) {
        History history = historyRepository.findById(historyId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 연혁을 찾을 수 없습니다: " + historyId));

        // 물리 삭제
        historyRepository.delete(history);
    }
}