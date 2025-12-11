package kr.ulsan.dreamshowchoir.dungeong.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.ulsan.dreamshowchoir.dungeong.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Tag(name = "S3 Upload", description = "이미지 업로드 API")
@RestController
@RequestMapping("/api/s3")
@RequiredArgsConstructor
public class S3Controller {

    private final S3Service s3Service;

    /**
     * 이미지 업로드 API
     * (POST /api/s3/upload)
     *
     * @param file 업로드할 파일 (MultipartFile)
     * @param dir  (선택) S3 내 저장할 폴더명 (기본값: "common")
     * @return 업로드된 파일의 전체 URL (String)
     */
    @Operation(summary = "가입 신청 이미지 업로드", description = "가입 신청서 작성 시 프로필 이미지를 S3(join-application 폴더)에 업로드하고 URL을 반환합니다.")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestPart(value = "file") MultipartFile file,
            @RequestParam(value = "dir", required = false, defaultValue = "common") String dir
    ) {
        // "join-application" 폴더에 이미지 저장
        String fileUrl = s3Service.uploadFile(file, dir);

        // URL 반환
        Map<String, String> response = new HashMap<>();
        response.put("imageUrl", fileUrl);

        return ResponseEntity.ok(response);
    }
}