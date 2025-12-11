package kr.ulsan.dreamshowchoir.dungeong.service;

import jakarta.persistence.EntityNotFoundException;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.MemberProfile;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.WithdrawalHistory;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.MemberProfileRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.UserRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.WithdrawalHistoryRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.common.PageResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.user.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;


@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final MemberProfileRepository memberProfileRepository;
    private final WithdrawalHistoryRepository withdrawalHistoryRepository;

    /**
     * OAuth 로그인 후, 추가 필수 정보(핸드폰, 생년월일 등)를 입력받아 저장한다.
     * (최초 가입 절차 - Onboarding)
     *
     * @param userId     현재 로그인한 사용자 ID
     * @param requestDto 추가 정보 DTO
     * @return 업데이트된 사용자 정보 DTO
     */
    public UserResponseDto updateSignUpInfo(Long userId, UserSignUpRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        // User 엔티티의 updateAdditionalInfo 메서드 호출 (이전 단계에서 추가했어야 함)
        user.updateAdditionalInfo(
                requestDto.getName(),
                requestDto.getPhoneNumber(),
                requestDto.getBirthDate(),
                requestDto.getGender(),
                requestDto.getTermsAgreed()
        );

        // GUEST 등급 -> USER 등급으로 (가입 완료 처리)
        if (user.getRole() == Role.GUEST) {
            user.upgradeToUser();
        }

        // UserResponseDto 생성 및 반환
        // (기존 AuthService의 로직을 참고하여 Builder 사용)
        return UserResponseDto.builder()
                .user(user)
                .profile(user.getMemberProfile()) // 프로필이 없으면 null 처리됨
                .build();
    }

    /**
     * 공개된 단원 목록 조회
     * (홈페이지 '단원 소개' 페이지용)
     *
     * @return 단원 프로필 DTO 리스트
     */
    @Transactional(readOnly = true)
    public PageResponseDto<MemberProfileResponseDto> getPublicMembers(String part, Pageable pageable) {

        // Repository 호출 (part가 없으면 전체 조회)
        Page<User> userPage = userRepository.findPublicMembers(part, pageable);

        // Entity -> DTO 변환
        Page<MemberProfileResponseDto> dtoPage = userPage.map(user -> new MemberProfileResponseDto(user.getMemberProfile()));

        // 공통 페이징 DTO로 반환
        return new PageResponseDto<>(dtoPage);
    }

    /**
     * 내 정보 수정
     * (이름, 전화번호, 생년월일, 성별)
     */
    public UserResponseDto updateMyInfo(Long userId, UserUpdateRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        // User 엔티티에 updateInfo 메서드 추가 필요 (아래 참고)
        user.updateInfo(
                requestDto.getName(),
                requestDto.getPhoneNumber(),
                requestDto.getBirthDate(),
                requestDto.getGender()
        );

        // 단원(MEMBER)이라면 프로필 정보도 수정
        if (user.getRole() == Role.MEMBER || user.getRole() == Role.ADMIN) {
            MemberProfile profile = user.getMemberProfile();

            // 만약 프로필이 없다면 생성 (방어 코드)
            if (profile == null) {
                profile = MemberProfile.builder()
                        .user(user)
                        .part(requestDto.getPart()) // 초기값
                        .build();
                // (Repository save 로직이 필요하거나 Cascade 설정을 믿어야 함)
                // 보통 가입 승인 시 프로필이 생기므로 여기서는 update만 호출
            }

            // 프로필 업데이트 (Entity에 편의 메서드 추가 필요)
            profile.updateProfileInfo(
                    requestDto.getPart(),
                    requestDto.getInterests(),
                    requestDto.getMyDream(),
                    requestDto.getHashTags()
            );
        }

        return UserResponseDto.builder()
                .user(user)
                .profile(user.getMemberProfile())
                .build();
    }

    /**
     * 회원 탈퇴 (논리 삭제)
     * - DB: Soft Delete
     * - OAuth: (선택사항) 연동 해제 로직이 필요하면 여기에 추가
     */
    @Transactional
    public void withdraw(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        // 재가입 방지를 위한 기록 남기기 (6개월 보관용)
        WithdrawalHistory history = WithdrawalHistory.builder()
                .oauthProvider(user.getOauthProvider())
                .oauthId(user.getOauthId())
                .email(user.getEmail())
                .build();
        withdrawalHistoryRepository.save(history); // Repository 생성 필요

        // S3 이미지 삭제
        if (user.getProfileImageKey() != null) {
            s3Service.deleteFile(user.getProfileImageKey());
        }
        // 탈퇴 시 연관된 MemberProfile 등은 Cascade 설정에 따라 처리됨.
        userRepository.delete(user);
    }

    /**
     * [관리자용] 특정 단원의 프로필 공개 여부 변경
     */
    public void changeMemberVisibility(Long targetUserId, boolean isPublic) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + targetUserId));

        MemberProfile profile = user.getMemberProfile();
        if (profile == null) {
            throw new IllegalStateException("해당 유저는 단원 프로필이 존재하지 않습니다.");
        }

        profile.changeVisibility(isPublic);
    }

    /**
     * [관리자용] 회원 목록 조회
     * @param role 등급 필터 (Optional)
     * @param name 이름 검색어 (Optional)
     * @param pageable 페이징 정보
     */
    @Transactional(readOnly = true)
    public PageResponseDto<UserAdminListResponseDto> getUsersForAdmin(Role role, String name, Pageable pageable) {

        Page<User> userPage = userRepository.findAllForAdmin(role, name, pageable);

        // Entity -> Admin용 DTO 변환
        Page<UserAdminListResponseDto> dtoPage = userPage.map(UserAdminListResponseDto::new);

        return new PageResponseDto<>(dtoPage);
    }

    /**
     * 내 정보 상세 조회 (User + MemberProfile)
     * (마이페이지용)
     */
    @Transactional(readOnly = true)
    public UserResponseDto getMyInfo(Long userId) {

        // User 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        // MemberProfile 조회 (없으면 null)
        // (User 엔티티에 @OneToOne 매핑이 되어 있다면 user.getMemberProfile()로 바로 접근 가능)
        // 만약 Lazy Loading 문제나 명시적 조회가 필요하다면 Repository 사용
        MemberProfile profile = user.getMemberProfile();

        // DTO 변환
        return new UserResponseDto(user, profile);
    }

    /**
     * 내 프로필 이미지 수정 (S3 업로드)
     */
    public UserResponseDto updateProfileImage(Long userId, MultipartFile file, String target) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        // 타겟 확인 및 기존 이미지 삭제
        String oldImageKey;

        if ("MEMBER".equalsIgnoreCase(target)) {
            // [단원 프로필 수정]
            if ((user.getRole() != Role.MEMBER && user.getRole() != Role.ADMIN) || user.getMemberProfile() == null) {
                throw new IllegalStateException("정단원만 단원 프로필 이미지를 설정할 수 있습니다.");
            }
            oldImageKey = user.getMemberProfile().getProfileImageKey();
        } else {
            // [기본 유저 프로필 수정]
            oldImageKey = user.getProfileImageKey();
        }

        // 기존 파일 삭제 (S3)
        if (oldImageKey != null && !oldImageKey.isEmpty()) {
            s3Service.deleteFile(oldImageKey);
        }

        // 새 이미지 업로드
        // 폴더명을 구분하면 관리가 더 편함 (profile/user vs profile/member)
        String folderName = "MEMBER".equalsIgnoreCase(target) ? "profile/member" : "profile/user";
        String newImageUrl = s3Service.uploadFile(file, folderName);

        // DB 업데이트 (분기 처리)
        if ("MEMBER".equalsIgnoreCase(target)) {
            user.getMemberProfile().updateProfileImage(newImageUrl);
        } else {
            user.updateProfileImage(newImageUrl);
        }

        return new UserResponseDto(user, user.getMemberProfile());
    }

    /**
     * [관리자용] 회원 강제 추방
     */
    @Transactional
    public void deleteUserByAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        // 프로필 이미지가 있다면 S3에서 삭제
        if (user.getProfileImageKey() != null) {
            s3Service.deleteFile(user.getProfileImageKey());
        }

        // 단원 프로필 사진도 있다면 삭제
        if (user.getMemberProfile() != null && user.getMemberProfile().getProfileImageKey() != null) {
            s3Service.deleteFile(user.getMemberProfile().getProfileImageKey());
        }

        // DB에서 삭제 (Cascade 설정에 따라 연관 데이터도 삭제됨)
        userRepository.delete(user);
    }

    /**
     * [관리자] 회원 권한(Role) 변경
     */
    @Transactional
    public UserResponseDto updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        // 권한 변경
        user.updateRole(newRole);

        // MEMBER 또는 ADMIN으로 승격 시, 프로필이 없으면 자동 생성
        if (newRole == Role.MEMBER || newRole == Role.ADMIN) {
            if (user.getMemberProfile() == null) {
                createDefaultMemberProfile(user);
            }
        } else if (newRole == Role.GUEST) {
            // 프로필이 있으면 '자동 삭제'
            if (user.getMemberProfile() != null) {
                // DB에서 삭제
                memberProfileRepository.delete(user.getMemberProfile());

                // 영속성 컨텍스트(메모리)에 있는 User 객체에서도 끊어줘야 이 트랜잭션 안에서 즉시 반영됨
                user.setMemberProfile(null);
            }
        }

        // 변경된 정보 반환
        return new UserResponseDto(user, user.getMemberProfile());
    }

    /**
     * 기본 MemberProfile 생성 헬퍼 메소드
     */
    private void createDefaultMemberProfile(User user) {
        MemberProfile newProfile = MemberProfile.builder()
                .user(user)
                .isPublic(false)
                .part("-")
                .interests("-")
                .myDream("-")
                .hashTags("")
                .profileImageKey("")
                .build();

        memberProfileRepository.save(newProfile);

        // 영속성 컨텍스트에 있는 User 객체에도 프로필을 연결해줘야 리턴되는 DTO에 즉시 반영됨
        user.setMemberProfile(newProfile);
    }
}