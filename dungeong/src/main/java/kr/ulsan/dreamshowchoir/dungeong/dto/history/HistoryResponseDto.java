package kr.ulsan.dreamshowchoir.dungeong.dto.history;

import kr.ulsan.dreamshowchoir.dungeong.domain.info.History;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class HistoryResponseDto {

    private final Long historyId;
    private final Integer year;
    private final Integer month;
    private final String content;
    private final LocalDateTime createdAt;

    /**
     * Entity를 DTO로 변환하는 생성자
     */
    public HistoryResponseDto(History history) {
        this.historyId = history.getHistoryId();
        this.year = history.getYear();
        this.month = history.getMonth();
        this.content = history.getContent();
        this.createdAt = history.getCreatedAt();
    }
}