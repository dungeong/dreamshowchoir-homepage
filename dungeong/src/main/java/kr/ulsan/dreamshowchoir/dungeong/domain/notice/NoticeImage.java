package kr.ulsan.dreamshowchoir.dungeong.domain.notice;

import jakarta.persistence.*;
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
@Table(name = "\"NoticeImage\"")
@EntityListeners(AuditingEntityListener.class)
public class NoticeImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IMAGE_ID")
    private Long imageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "NOTICE_ID", nullable = false)
    private Notice notice;

    @Column(name = "IMAGE_KEY", nullable = false, unique = true)
    private String imageKey;

    @Column(name = "IMAGE_NAME", nullable = false)
    private String imageName;

    @Column(name = "FILE_SIZE")
    private Long fileSize;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 생성자
    @Builder
    public NoticeImage(Notice notice, String imageKey, String imageName, Long fileSize) {
        this.notice = notice;
        this.imageKey = imageKey;
        this.imageName = imageName;
        this.fileSize = fileSize;
    }
}
