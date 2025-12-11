package kr.ulsan.dreamshowchoir.dungeong.service;

import kr.ulsan.dreamshowchoir.dungeong.dto.common.RecaptchaResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecaptchaService {

    @Value("${recaptcha.secret-key}")
    private String recaptchaSecretKey;

    private static final String RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    /**
     * Google reCAPTCHA 서버에 토큰 검증을 요청
     *
     * @param recaptchaToken 프론트엔드에서 받은 토큰
     * @return 검증 성공 여부 (v3의 경우 점수(score)도 확인)
     */
    public boolean validateToken(String recaptchaToken) {
        if (recaptchaToken == null || recaptchaToken.isEmpty()) {
            return false;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();

            // Google에 보낼 파라미터 설정 (비밀 키, 토큰)
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("secret", recaptchaSecretKey);
            params.add("response", recaptchaToken);
            // 필요시 params.add("remoteip", userIpAddress); 추가

            // API 호출 및 응답(JSON)을 DTO로 파싱
            RecaptchaResponseDto response = restTemplate.postForObject(RECAPTCHA_VERIFY_URL, params, RecaptchaResponseDto.class);

            if (response == null) {
                log.warn("reCAPTCHA 검증 응답이 null입니다.");
                return false;
            }

            // 성공 여부 및 봇 점수(0.5점 이상) 확인
            log.info("reCAPTCHA 검증 결과: success={}, score={}", response.isSuccess(), response.getScore());
            return response.isSuccess() && response.getScore() >= 0.5;

        } catch (Exception e) {
            log.error("reCAPTCHA 검증 중 예외 발생: {}", e.getMessage());
            return false;
        }
    }
}