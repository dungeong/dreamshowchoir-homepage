package kr.ulsan.dreamshowchoir.dungeong.dto.activity;

import kr.ulsan.dreamshowchoir.dungeong.domain.activity.ActivityMaterial;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ActivityMaterialResponseDto {
    private final Long materialId;
    private final String title;
    private final String description;
    private final String fileName;
    private final String fileKey;
    private final Long fileSize;
    private final LocalDateTime createdAt;
    private final Long userId;
    private final String authorName;

    public ActivityMaterialResponseDto(ActivityMaterial material) {
        this.materialId = material.getMaterialId();
        this.title = material.getTitle();
        this.description = material.getDescription();
        this.fileName = material.getFileName();
        this.fileKey = material.getFileKey();
        this.fileSize = material.getFileSize();
        this.createdAt = material.getCreatedAt();
        if (material.getUser() != null) {
            this.userId = material.getUser().getUserId();
            this.authorName = material.getUser().getName();
        } else {
            this.userId = null;
            this.authorName = "알 수 없는 관리자";
        }
    }
}