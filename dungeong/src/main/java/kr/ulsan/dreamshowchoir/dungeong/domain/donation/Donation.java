package kr.ulsan.dreamshowchoir.dungeong.domain.donation;

import jakarta.persistence.*;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "\"Donation\"")
@EntityListeners(AuditingEntityListener.class)
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DONATION_ID")
    private Long donationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "AMOUNT", nullable = false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "TYPE")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private DonationType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false)
    private DonationStatus status;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 생성자
    @Builder
    public Donation(User user, Long amount, DonationType type) {
        this.user = user;
        this.amount = amount;
        this.type = type;
        this.status = DonationStatus.PENDING;
    }

    public void markAsCompleted() {
        this.status = DonationStatus.COMPLETED;
    }

    public void markAsFailed() {
        this.status = DonationStatus.FAILED;
    }
}
