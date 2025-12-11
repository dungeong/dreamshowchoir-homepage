package kr.ulsan.dreamshowchoir.dungeong.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
public class ScheduleDto {
    private String id; // 구글 캘린더 이벤트 ID
    private String summary; // 일정 제목
    private String description; // 상세 설명
    private String location; // 장소
    private LocalDateTime start; // 시작 시간 (내부 로직 처리용)
    private LocalDateTime end; // 종료 시간 (내부 로직 처리용)
}
