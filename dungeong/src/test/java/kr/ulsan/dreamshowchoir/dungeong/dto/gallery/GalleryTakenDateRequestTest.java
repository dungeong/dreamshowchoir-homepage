package kr.ulsan.dreamshowchoir.dungeong.dto.gallery;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class GalleryTakenDateRequestTest {
    private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Test
    void createRequestStoresTheCalendarDate() throws Exception {
        var request = mapper.readValue("""
                {"title":"수국 페스티벌","type":"IRREGULAR","takenDate":"2025-06-14"}
                """, GalleryCreateRequestDto.class);

        assertThat(request.toEntity(null).getTakenDate()).isEqualTo(LocalDate.of(2025, 6, 14));
    }

    @Test
    void updateRequestDistinguishesClearingFromOmittingTheDate() throws Exception {
        var omitted = mapper.readValue("{}", GalleryUpdateRequestDto.class);
        var cleared = mapper.readValue("{\"takenDate\":null}", GalleryUpdateRequestDto.class);
        var changed = mapper.readValue("{\"takenDate\":\"2025-09-27\"}", GalleryUpdateRequestDto.class);

        assertThat(omitted.hasTakenDate()).isFalse();
        assertThat(cleared.hasTakenDate()).isTrue();
        assertThat(cleared.getTakenDate()).isNull();
        assertThat(changed.hasTakenDate()).isTrue();
        assertThat(changed.getTakenDate()).isEqualTo(LocalDate.of(2025, 9, 27));
    }
}
