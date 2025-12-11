package kr.ulsan.dreamshowchoir.dungeong.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.model.Events;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import jakarta.annotation.PostConstruct;
import kr.ulsan.dreamshowchoir.dungeong.dto.ScheduleDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class GoogleCalendarService {

    private static final String APPLICATION_NAME = "DreamShowChoir";
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    @Value("${google.calendar.credentials-path}")
    private String credentialsPath;

    @Value("${google.calendar.practice-id}")
    private String practiceCalendarId;

    @Value("${google.calendar.performance-id}")
    private String performanceCalendarId;

    private Calendar calendarClient;

    @PostConstruct
    public void init() {
        try {
            InputStream in = new ClassPathResource(credentialsPath).getInputStream();

            GoogleCredentials credentials = GoogleCredentials.fromStream(in)
                    .createScoped(Collections.singleton(CalendarScopes.CALENDAR));

            HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(credentials);

            this.calendarClient = new Calendar.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    JSON_FACTORY,
                    requestInitializer)
                    .setApplicationName(APPLICATION_NAME)
                    .build();
        } catch (IOException | GeneralSecurityException e) {
            log.error("Failed to initialize Google Calendar Service", e);
        }
    }

    public List<ScheduleDto> getEvents(String type, Integer year, Integer month) throws IOException {
        String calendarId = getCalendarId(type);

        Calendar.Events.List request = calendarClient.events().list(calendarId)
                .setOrderBy("startTime")
                .setSingleEvents(true);

        if (year != null && month != null) {
            java.time.YearMonth yearMonth = java.time.YearMonth.of(year, month);
            LocalDateTime start = yearMonth.atDay(1).atStartOfDay();
            LocalDateTime end = yearMonth.plusMonths(1).atDay(1).atStartOfDay();

            DateTime minTime = new DateTime(java.util.Date.from(start.atZone(ZoneId.systemDefault()).toInstant()));
            DateTime maxTime = new DateTime(java.util.Date.from(end.atZone(ZoneId.systemDefault()).toInstant()));

            request.setTimeMin(minTime).setTimeMax(maxTime);
        }

        Events events = request.execute();

        return events.getItems().stream()
                .map(this::toScheduleDto)
                .collect(Collectors.toList());
    }

    public ScheduleDto createEvent(String type, ScheduleDto dto) throws IOException {
        String calendarId = getCalendarId(type);

        Event eventToInsert = toGoogleEvent(dto);
        Event createdEvent = calendarClient.events().insert(calendarId, eventToInsert).execute();

        return toScheduleDto(createdEvent);
    }

    public ScheduleDto updateEvent(String type, String eventId, ScheduleDto dto) throws IOException {
        String calendarId = getCalendarId(type);

        Event eventToUpdate = toGoogleEvent(dto);
        Event updatedEvent = calendarClient.events().patch(calendarId, eventId, eventToUpdate).execute();

        return toScheduleDto(updatedEvent);
    }

    public void deleteEvent(String type, String eventId) throws IOException {
        String calendarId = getCalendarId(type);

        calendarClient.events().delete(calendarId, eventId).execute();
    }

    private String getCalendarId(String type) {
        if ("practice".equalsIgnoreCase(type)) {
            return practiceCalendarId;
        } else if ("performance".equalsIgnoreCase(type)) {
            return performanceCalendarId;
        }
        log.error("Invalid calendar type provided: {}", type);
        throw new IllegalArgumentException("Invalid calendar type: " + type);
    }

    private ScheduleDto toScheduleDto(Event event) {
        ScheduleDto dto = new ScheduleDto();
        dto.setId(event.getId());
        dto.setSummary(event.getSummary());
        dto.setDescription(event.getDescription());
        dto.setLocation(event.getLocation());
        if (event.getStart() != null && event.getStart().getDateTime() != null) {
            dto.setStart(toLocalDateTime(event.getStart().getDateTime()));
        }
        if (event.getEnd() != null && event.getEnd().getDateTime() != null) {
            dto.setEnd(toLocalDateTime(event.getEnd().getDateTime()));
        }
        return dto;
    }

    private Event toGoogleEvent(ScheduleDto dto) {
        Event event = new Event()
                .setSummary(dto.getSummary())
                .setDescription(dto.getDescription())
                .setLocation(dto.getLocation());

        if (dto.getStart() != null) {
            event.setStart(new EventDateTime().setDateTime(toDateTime(dto.getStart())));
        }
        if (dto.getEnd() != null) {
            event.setEnd(new EventDateTime().setDateTime(toDateTime(dto.getEnd())));
        }
        return event;
    }

    private LocalDateTime toLocalDateTime(DateTime dateTime) {
        return LocalDateTime.ofInstant(java.time.Instant.ofEpochMilli(dateTime.getValue()), ZoneId.systemDefault());
    }

    private DateTime toDateTime(LocalDateTime localDateTime) {
        return new DateTime(localDateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
    }
}
