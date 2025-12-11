package kr.ulsan.dreamshowchoir.dungeong.domain.user;

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
@EntityListeners(AuditingEntityListener.class)
@Entity
@Table(name = "\"WithdrawalHistory\"",
        uniqueConstraints = @UniqueConstraint(
                name = "UQ_WithdrawalHistory_OAuth",
                columnNames = {"OAUTH_PROVIDER", "OAUTH_ID"}
        ))
public class WithdrawalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "HISTORY_ID") // ★ V18에서 바꾼 컬럼명
    private Long id;

    @Column(name = "OAUTH_PROVIDER", nullable = false, length = 50)
    private String oauthProvider;

    @Column(name = "OAUTH_ID", nullable = false)
    private String oauthId;

    @Column(name = "EMAIL")
    private String email;

    @CreatedDate
    @Column(name = "WITHDRAWN_AT", nullable = false, updatable = false)
    private LocalDateTime withdrawnAt;

    @Builder
    public WithdrawalHistory(String oauthProvider, String oauthId, String email) {
        this.oauthProvider = oauthProvider;
        this.oauthId = oauthId;
        this.email = email;
    }
}