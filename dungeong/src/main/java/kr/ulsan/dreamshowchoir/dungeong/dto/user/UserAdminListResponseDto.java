package kr.ulsan.dreamshowchoir.dungeong.dto.user;

import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UserAdminListResponseDto {

    private final Long userId;
    private final String name;
    private final String email;
    private final String phoneNumber;
    private final Role role;       // GUEST, USER, MEMBER, ADMIN
    private final String part;     // (단원인 경우) 파트
    private final LocalDateTime createdAt; // 가입일

    public UserAdminListResponseDto(User user) {
        this.userId = user.getUserId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.role = user.getRole();
        this.createdAt = user.getCreatedAt();

        // MemberProfile이 있으면 파트 정보 가져오기, 없으면 null
        if (user.getMemberProfile() != null) {
            this.part = user.getMemberProfile().getPart();
        } else {
            this.part = null; // 준회원(USER) 등은 파트가 없음
        }
    }
}