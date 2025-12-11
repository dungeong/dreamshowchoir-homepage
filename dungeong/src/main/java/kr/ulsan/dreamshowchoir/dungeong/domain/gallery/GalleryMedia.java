package kr.ulsan.dreamshowchoir.dungeong.domain.gallery;

import jakarta.persistence.*;
import kr.ulsan.dreamshowchoir.dungeong.domain.common.MediaType;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "\"GalleryMedia\"")
@EntityListeners(AuditingEntityListener.class)
public class GalleryMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MEDIA_ID")
    private Long mediaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "GALLERY_ID", nullable = false)
    private Gallery gallery;

    @Column(name = "FILE_KEY", nullable = false, unique = true)
    private String fileKey;

    @Column(name = "FILE_NAME", nullable = false)
    private String fileName;

    @Enumerated(EnumType.STRING)
    @Column(name = "MEDIA_TYPE", nullable = false)
    private MediaType mediaType;

    @Column(name = "FILE_SIZE")
    private Long fileSize;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 생성자
    @Builder
    public GalleryMedia(Gallery gallery, String fileKey, String fileName, MediaType mediaType, Long fileSize) {
        this.gallery = gallery;
        this.fileKey = fileKey;
        this.fileName = fileName;
        this.mediaType = mediaType;
        this.fileSize = fileSize;
    }
}
