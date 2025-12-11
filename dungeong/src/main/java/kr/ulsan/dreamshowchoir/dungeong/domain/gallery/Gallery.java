package kr.ulsan.dreamshowchoir.dungeong.domain.gallery;

import jakarta.persistence.*;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Table;
import kr.ulsan.dreamshowchoir.dungeong.domain.common.BaseTimeEntity;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "\"Gallery\"")
@SQLDelete(sql = "UPDATE \"Gallery\" SET \"DELETED_AT\" = CURRENT_TIMESTAMP WHERE \"GALLERY_ID\" = ?")
@SQLRestriction("\"DELETED_AT\" IS NULL")
@DynamicUpdate
public class Gallery extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "GALLERY_ID")
    private Long galleryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private User user;

    @Column(name = "TYPE", nullable = false)
    private String type;

    @Column(name = "TITLE", nullable = false)
    private String title;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    // 양방향 관계 설정
    @OneToMany(mappedBy = "gallery", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 100)
    private final List<GalleryMedia> galleryMedia = new ArrayList<>();

    // 생성자
    @Builder
    public Gallery(User user, String type, String title, String description) {
        this.user = user;
        this.type = type;
        this.title = title;
        this.description = description;
    }

    public void update(String type, String title, String description) {
        this.type = type;
        this.title = title;
        this.description = description;
    }
}
