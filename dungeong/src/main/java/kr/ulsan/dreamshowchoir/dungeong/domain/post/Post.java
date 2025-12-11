package kr.ulsan.dreamshowchoir.dungeong.domain.post;

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
@Table(name = "\"Post\"")
@SQLDelete(sql = "UPDATE \"Post\" SET \"DELETED_AT\" = CURRENT_TIMESTAMP WHERE \"POST_ID\" = ?")
@SQLRestriction("\"DELETED_AT\" IS NULL")
@DynamicUpdate
public class Post extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "POST_ID")
    private Long postId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(name = "TITLE", nullable = false)
    private String title;

    @Column(name = "CONTENT", nullable = false, columnDefinition = "TEXT")
    private String content;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<PostImage> postImages = new ArrayList<>();

    // 댓글 리스트 매핑 + 성능 최적화(@BatchSize)
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 100) // 목록 조회 시 댓글 개수 셀 때 쿼리 한 번으로 해결
    private final List<Comment> comments = new ArrayList<>();

    // 생성자
    @Builder
    public Post(User user, String title, String content) {
        this.user = user;
        this.title = title;
        this.content = content;
    }

    public void update(String title, String content) {
        final String SUFFIX = " (수정됨)";
        if (title != null && !title.endsWith(SUFFIX)) {
            this.title = title + SUFFIX;
        } else {
            this.title = title;
        }
        this.content = content;
    }
}