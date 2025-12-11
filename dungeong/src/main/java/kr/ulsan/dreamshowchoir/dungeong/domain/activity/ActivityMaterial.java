package kr.ulsan.dreamshowchoir.dungeong.domain.activity;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import kr.ulsan.dreamshowchoir.dungeong.domain.common.BaseTimeEntity;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.*;
import org.hibernate.annotations.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "\"ActivityMaterial\"")
@SQLDelete(sql = "UPDATE \"ActivityMaterial\" SET \"DELETED_AT\" = CURRENT_TIMESTAMP WHERE \"MATERIAL_ID\" = ?")
@SQLRestriction("\"DELETED_AT\" IS NULL")
@DynamicUpdate
public class ActivityMaterial extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MATERIAL_ID")
    private Long materialId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private User user;

    @Column(name = "TITLE", nullable = false)
    private String title;

    @Column(name = "FILE_KEY", nullable = false, unique = true)
    private String fileKey;

    @Column(name = "FILE_NAME", nullable = false)
    private String fileName;

    @Column(name = "FILE_SIZE")
    private Long fileSize;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    // 업데이트
    public void update(String title, String description) {
        this.title = title;
        this.description = description;
    }
}