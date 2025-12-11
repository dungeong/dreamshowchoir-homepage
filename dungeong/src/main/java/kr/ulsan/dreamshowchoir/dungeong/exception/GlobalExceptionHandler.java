package kr.ulsan.dreamshowchoir.dungeong.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * [Exception Handler] 파일 업로드 용량 초과 시 발생
     * spring.servlet.multipart.max-file-size / max-request-size 설정값 초과 시
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    protected ResponseEntity<String> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e) {
        log.warn("handleMaxUploadSizeExceededException", e); // 서버 콘솔에 경고 로그 남김

        String errorMessage = "업로드 가능한 최대 파일 크기를 초과했습니다. (제한: " + e.getMaxUploadSize() + " bytes)";

        // HTTP 상태 코드 413 (Payload Too Large) 반환
        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(errorMessage);
    }
}