package kr.ulsan.dreamshowchoir.dungeong.domain.sheet;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import kr.ulsan.dreamshowchoir.dungeong.domain.common.BaseTimeEntity;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.*;
import org.hibernate.annotations.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "\"Sheet\"")
@SQLDelete(sql = "UPDATE \"Sheet\" SET \"DELETED_AT\" = CURRENT_TIMESTAMP WHERE \"SHEET_ID\" = ?")
@SQLRestriction("\"DELETED_AT\" IS NULL")
@DynamicUpdate
public class Sheet extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SHEET_ID")
    private Long sheetId;

    @ManyToOne(fetch = FetchType.LAZY) // User와 다대일(N:1) 관계 (업로더)
    @JoinColumn(name = "USER_ID")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private User user;

    @Column(name = "FILE_KEY", nullable = false, unique = true)
    private String fileKey;

    @Column(name = "FILE_NAME", nullable = false)
    private String fileName;

    @Column(name = "FILE_SIZE")
    private Long fileSize;
}
