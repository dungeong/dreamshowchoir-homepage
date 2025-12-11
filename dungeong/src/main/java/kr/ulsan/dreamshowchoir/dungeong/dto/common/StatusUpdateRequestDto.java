package kr.ulsan.dreamshowchoir.dungeong.dto.common;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StatusUpdateRequestDto {

    @NotNull(message = "상태를 지정해야 합니다. (APPROVED or REJECTED)")
    private String status;
}