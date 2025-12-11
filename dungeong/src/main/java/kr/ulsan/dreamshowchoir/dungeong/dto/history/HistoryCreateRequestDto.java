package kr.ulsan.dreamshowchoir.dungeong.dto.history;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import kr.ulsan.dreamshowchoir.dungeong.domain.info.History;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class HistoryCreateRequestDto {

    @NotNull(message = "연도를 입력해주세요.")
    private Integer year;

    @NotNull(message = "월을 입력해주세요.")
    @Min(value = 1, message = "월은 1월부터 12월 사이여야합니다.")
    @Max(value = 12, message = "월은 1월부터 12월 사이여야합니다.")
    private Integer month;

    @NotBlank(message = "내용을 입력해주세요.")
    private String content;

    /**
     * DTO를 History 엔티티로 변환하는 편의 메소드
     */
    public History toEntity() {
        return History.builder()
                .year(this.year)
                .month(this.month)
                .content(this.content)
                .build();
    }
}