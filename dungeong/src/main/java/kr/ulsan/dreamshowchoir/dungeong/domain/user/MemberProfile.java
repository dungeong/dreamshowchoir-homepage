package kr.ulsan.dreamshowchoir.dungeong.domain.user;


import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "\"MemberProfile\"")
@DynamicUpdate
public class MemberProfile {

    @Id
    @Column(name = "USER_ID")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "USER_ID")
    private User user;

    @Column(name = "PART", nullable = false)
    private String part;

    @Column(name = "INTERESTS")
    private String interests;

    @Column(name = "MY_DREAM")
    private String myDream;

    @Column(name = "HASH_TAGS")
    private String hashTags;

    @Column(name = "PROFILE_IMAGE_KEY")
    private String profileImageKey;

    @Column(name = "IS_PUBLIC", nullable = false)
    private Boolean isPublic;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    // 생성자
    @Builder
    public MemberProfile(User user, String part, String interests, String myDream, String hashTags, String profileImageKey, Boolean isPublic, LocalDateTime updatedAt) {
        this.user = user;
        this.part = part;
        this.interests = interests;
        this.myDream = myDream;
        this.hashTags = hashTags;
        this.profileImageKey = profileImageKey;
        this.isPublic = isPublic;
        this.updatedAt = LocalDateTime.now();
    }


    /**
     * 프로필 이미지만 수정
     */
    public void updateProfileImage(String profileImageKey) {
        this.profileImageKey = profileImageKey;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * [본인용] 프로필 텍스트 정보 수정
     */
    public void updateProfileInfo(String part, String interests, String myDream, String hashTags) {
        if (part != null) {
            this.part = part;
        }
        if (interests != null) {
            this.interests = interests;
        }
        if (myDream != null) {
            this.myDream = myDream;
        }
        if (hashTags != null) {
            this.hashTags = hashTags;
        }
    }

    /**
     * [관리자용] 프로필 공개 여부 변경
     */
    public void changeVisibility(boolean isPublic) {
        this.isPublic = isPublic;
    }
}
