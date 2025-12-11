package kr.ulsan.dreamshowchoir.dungeong.dto.user;

import kr.ulsan.dreamshowchoir.dungeong.domain.user.JoinApplication;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.JoinStatus;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class JoinApplicationResponseDto {

    private final Long joinId;
    private final String part;
    private final String interests;
    private final String myDream;
    private final String hashTags;
    private final JoinStatus status;
    private final LocalDateTime createdAt;
    private final Long userId;
    private final String userName;
    private final String userEmail;
    private final String phoneNumber;
    private final String profileImage;

    /**
     * Entity를 DTO로 변환하는 생성자
     */
    public JoinApplicationResponseDto(JoinApplication application) {
        this.joinId = application.getJoinId();
        this.part = application.getPart();
        this.interests = application.getInterests();
        this.myDream = application.getMyDream();
        this.hashTags = application.getHashTags();
        this.status = application.getStatus();
        this.createdAt = application.getCreatedAt();
        this.userId = application.getUser().getUserId();
        this.userEmail = application.getUser().getEmail();
        this.userName = application.getUser().getName();
        this.phoneNumber = application.getUser().getPhoneNumber();
        this.profileImage = (application.getProfileImage() != null)
                ? application.getProfileImage()
                : application.getUser().getProfileImageKey();
    }
}