package kr.ulsan.dreamshowchoir.dungeong.domain.info;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "\"History\"")
@EntityListeners(AuditingEntityListener.class)
public class History {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "HISTORY_ID")
    private Long historyId;

    @Column(name = "YEAR", nullable = false)
    private Integer year;

    @Column(name = "CONTENT", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "MONTH", nullable = false)
    private Integer month;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 연혁 수정
    public void update(Integer year, Integer month, String content) {
        this.year = year;
        this.month = month;
        this.content = content;
    }
}