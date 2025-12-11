package kr.ulsan.dreamshowchoir.dungeong.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.ulsan.dreamshowchoir.dungeong.dto.ScheduleDto;
import kr.ulsan.dreamshowchoir.dungeong.service.GoogleCalendarService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@Tag(name = "일정 API", description = "Google Calendar와 연동된 일정 관리 API")
@RestController
@RequestMapping("/api")
public class ScheduleController {

    private final GoogleCalendarService googleCalendarService;

    public ScheduleController(GoogleCalendarService googleCalendarService) {
        this.googleCalendarService = googleCalendarService;
    }

    @Operation(summary = "일정 목록 조회", description = "연습 또는 공연 일정을 조회합니다.")
    @GetMapping("/schedule/{type}")
    public ResponseEntity<List<ScheduleDto>> getSchedule(
            @Parameter(description = "'practice' 또는 'performance'") @PathVariable String type,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) throws IOException { // params added

        // If year/month are null, default to current?
        // User request: "If parameters are missing, default to the current year and
        // month."
        if (year == null || month == null) {
            java.time.LocalDate now = java.time.LocalDate.now();
            if (year == null)
                year = now.getYear();
            if (month == null)
                month = now.getMonthValue();
        }

        return ResponseEntity.ok(googleCalendarService.getEvents(type, year, month));
    }

    @Operation(summary = "새 일정 등록 (관리자)", description = "새로운 연습 또는 공연 일정을 등록합니다.")
    @PostMapping("/admin/schedule/{type}")
    public ResponseEntity<ScheduleDto> createSchedule(
            @Parameter(description = "'practice' 또는 'performance'") @PathVariable String type,
            @RequestBody ScheduleDto dto) throws IOException {
        return ResponseEntity.ok(googleCalendarService.createEvent(type, dto));
    }

    @Operation(summary = "일정 수정 (관리자)", description = "기존 연습 또는 공연 일정을 수정합니다.")
    @PatchMapping("/admin/schedule/{type}/{eventId}")
    public ResponseEntity<ScheduleDto> updateSchedule(
            @Parameter(description = "'practice' 또는 'performance'") @PathVariable String type,
            @Parameter(description = "Google Calendar Event ID") @PathVariable String eventId,
            @RequestBody ScheduleDto dto) throws IOException {
        return ResponseEntity.ok(googleCalendarService.updateEvent(type, eventId, dto));
    }

    @Operation(summary = "일정 삭제 (관리자)", description = "기존 연습 또는 공연 일정을 삭제합니다.")
    @DeleteMapping("/admin/schedule/{type}/{eventId}")
    public ResponseEntity<Void> deleteSchedule(
            @Parameter(description = "'practice' 또는 'performance'") @PathVariable String type,
            @Parameter(description = "Google Calendar Event ID") @PathVariable String eventId) throws IOException {
        googleCalendarService.deleteEvent(type, eventId);
        return ResponseEntity.noContent().build();
    }
}
