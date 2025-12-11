package kr.ulsan.dreamshowchoir.dungeong.service;

import io.awspring.cloud.s3.S3Resource;
import io.awspring.cloud.s3.S3Template;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Template s3Template;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucketName;

    /**
     * 파일을 S3에 업로드하고, 업로드된 파일의 전체 URL을 반환
     *
     * @param file    업로드할 파일
     * @param dirName 저장할 폴더 이름 (예: "profile")
     * @return 업로드된 파일의 전체 URL (https://...)
     */
    public String uploadFile(MultipartFile file, String dirName) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 비어있습니다.");
        }

        // 파일 이름 중복 방지를 위해 UUID 생성
        String originalFilename = file.getOriginalFilename();
        String uuid = UUID.randomUUID().toString();

        // S3 Key 생성 (예: "profile/uuid-originalName.jpg")
        String s3Key = dirName + "/" + uuid + "-" + originalFilename;

        try (InputStream inputStream = file.getInputStream()) {
            // S3에 업로드 (upload 메소드 사용)
            S3Resource resource = s3Template.upload(bucketName, s3Key, inputStream);

            // 업로드된 파일의 URL 반환
            return resource.getURL().toString();

        } catch (IOException e) {
            // getURL()이나 getInputStream()에서 발생하는 예외 처리
            log.error("S3 업로드 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("파일 업로드에 실패했습니다.", e);
        }
    }

    /**
     * S3에서 파일 삭제
     *
     * @param fileUrl 삭제할 파일의 전체 URL 또는 Key
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        try {
            // URL에서 Key만 추출
            String s3Key = fileUrl;
            if (fileUrl.contains("amazonaws.com/")) {
                s3Key = fileUrl.substring(fileUrl.indexOf("amazonaws.com/") + 14);
            }

            // 파일 삭제
            s3Template.deleteObject(bucketName, s3Key);
            log.info("S3 파일 삭제 성공: {}", s3Key);

        } catch (Exception e) {
            log.error("S3 파일 삭제 실패: {}", e.getMessage());
            // 삭제 실패는 서비스 흐름을 막지 않도록 로그만 남기고 넘어감
        }
    }
}