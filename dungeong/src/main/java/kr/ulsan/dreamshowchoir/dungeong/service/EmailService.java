package kr.ulsan.dreamshowchoir.dungeong.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;

    /**
     * 이메일 발송 (비동기)
     * - 메일 보내는 데 시간이 걸려도, 사용자는 바로 응답을 받을 수 있음.
     */
    @Async
    public void sendEmail(String to, String subject, String content) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true); // true: HTML 형식 사용 가능

            javaMailSender.send(mimeMessage);
            log.info("이메일 발송 성공: {}", to);

        } catch (MessagingException e) {
            log.error("이메일 발송 실패: {}", e.getMessage());
            // 메일 발송 실패가 전체 로직(답변 등록)을 롤백시키지 않도록 예외를 삼키거나 별도 처리
        }
    }
}