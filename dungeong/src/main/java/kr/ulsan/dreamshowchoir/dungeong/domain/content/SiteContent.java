package kr.ulsan.dreamshowchoir.dungeong.domain.content;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicUpdate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE) // Builder를 위해 추가
@Builder(toBuilder = true)
@Entity
@Table(name = "\"SiteContent\"")
@EntityListeners(AuditingEntityListener.class) // @LastModifiedDate 활성화
@DynamicUpdate
public class SiteContent {

    @Id
    @Column(name = "CONTENT_KEY")
    private String contentKey; // "RECRUIT_GUIDE", "DONATION_GUIDE"

    @Column(name = "CONTENT", columnDefinition = "TEXT")
    private String content;

    @LastModifiedDate // 4. 수정 시각 자동 갱신
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    /**
     * 콘텐츠 수정 (제목, 내용)
     */
    public void update(String content) {
        this.content = content;
    }
}