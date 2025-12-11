package kr.ulsan.dreamshowchoir.dungeong.domain.banner;

import jakarta.persistence.*;
import kr.ulsan.dreamshowchoir.dungeong.domain.common.BaseTimeEntity;
import lombok.*;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "\"Banner\"")
@SQLDelete(sql = "UPDATE \"Banner\" SET \"DELETED_AT\" = CURRENT_TIMESTAMP WHERE \"BANNER_ID\" = ?")
@SQLRestriction("\"DELETED_AT\" IS NULL")
@DynamicUpdate
public class Banner extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BANNER_ID")
    private Long bannerId;

    @Column(name = "IMAGE_KEY", nullable = false, unique = true)
    private String imageKey;

    @Column(name = "IMAGE_NAME", nullable = false)
    private String imageName;

    @Column(name = "TITLE")
    private String title;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "IS_ACTIVE", nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "ORDER_INDEX", nullable = false)
    private Integer orderIndex = 0;

    // 수정
    public void update(String imageKey, String imageName, String title, String description, Integer orderIndex) {
        this.imageKey = imageKey;
        this.imageName = imageName;
        this.title = title;
        this.description = description;
        this.orderIndex = orderIndex;
    }

    // 활성화/비활성화
    public void activate() {
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }
}
