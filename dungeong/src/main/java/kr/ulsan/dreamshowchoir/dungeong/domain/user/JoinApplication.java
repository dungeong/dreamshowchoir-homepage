package kr.ulsan.dreamshowchoir.dungeong.domain.user;

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
@Table(name = "\"JoinApplication\"")
@EntityListeners(AuditingEntityListener.class)
public class JoinApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "JOIN_ID")
    private Long joinId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "PART", nullable = false)
    private String part;

    @Column(name = "INTERESTS")
    private String interests;

    @Column(name = "MY_DREAM", columnDefinition = "TEXT")
    private String myDream;

    @Column(name = "HASH_TAGS")
    private String hashTags;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false)
    private JoinStatus status = JoinStatus.PENDING;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "PROFILE_IMAGE")
    private String profileImage;


    // 승인/거절
    public void approve() {
        this.status = JoinStatus.APPROVED;
    }

    public void reject() {
        this.status = JoinStatus.REJECTED;
    }
}