package kr.ulsan.dreamshowchoir.dungeong.dto.common;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // 모르는 필드는 무시
public class RecaptchaResponseDto {

    private boolean success; // 성공 여부
    private double score;    // 봇 점수 (0.0 ~ 1.0)

    @JsonProperty("challenge_ts")
    private String challengeTs; // 타임스탬프

    private String hostname;

    @JsonProperty("error-codes")
    private String[] errorCodes;
}