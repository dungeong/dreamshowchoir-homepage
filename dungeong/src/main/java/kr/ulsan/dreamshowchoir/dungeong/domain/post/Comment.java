package kr.ulsan.dreamshowchoir.dungeong.domain.post;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import kr.ulsan.dreamshowchoir.dungeong.domain.common.BaseTimeEntity;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "\"Comment\"")
@SQLDelete(sql = "UPDATE \"Comment\" SET \"DELETED_AT\" = CURRENT_TIMESTAMP WHERE \"COMMENT_ID\" = ?")
@SQLRestriction("\"DELETED_AT\" IS NULL")
@DynamicUpdate
public class Comment extends BaseTimeEntity { // [변경] 상속 적용

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "COMMENT_ID")
    private Long commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POST_ID", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(name = "CONTENT", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Builder
    public Comment(Post post, User user, String content) {
        this.post = post;
        this.user = user;
        this.content = content;
    }

    // 댓글 내용 수정
    public void update(String content) {
        this.content = content;
    }
}