package kr.ulsan.dreamshowchoir.dungeong.domain.communicate;

import jakarta.persistence.*;
import kr.ulsan.dreamshowchoir.dungeong.domain.common.BaseAuditEntity;
import lombok.*;
import org.hibernate.annotations.DynamicUpdate;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "\"Faq\"")
@DynamicUpdate
public class Faq extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FAQ_ID")
    private Long faqId;

    @Column(name = "QUESTION", nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "ANSWER", nullable = false, columnDefinition = "TEXT")
    private String answer;

    // FAQ 수정
    public void update(String question, String answer) {
        this.question = question;
        this.answer = answer;
    }
}
