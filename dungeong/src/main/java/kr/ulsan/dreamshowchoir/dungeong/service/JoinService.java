package kr.ulsan.dreamshowchoir.dungeong.service;

import jakarta.persistence.EntityNotFoundException;
import kr.ulsan.dreamshowchoir.dungeong.domain.notification.Notification;
import kr.ulsan.dreamshowchoir.dungeong.domain.notification.NotificationType;
import kr.ulsan.dreamshowchoir.dungeong.domain.notification.repository.NotificationRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.JoinApplication;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.JoinStatus;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.MemberProfile;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.JoinApplicationRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.MemberProfileRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.UserRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.common.PageResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.common.StatusUpdateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.user.JoinApplicationRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.user.JoinApplicationResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional // 클래스 레벨 트랜잭션 (모든 public 메소드에 적용)
public class JoinService {

    private final JoinApplicationRepository joinApplicationRepository;
    private final UserRepository userRepository;
    private final MemberProfileRepository memberProfileRepository;
    private final NotificationRepository notificationRepository;

    /**
     * 새로운 단원 가입 신청서를 제출
     * 이미 신청한 유저는 중복 신청 X
     *
     * @param requestDto 신청서 내용 DTO
     * @param userId     현재 인증된 사용자의 ID (JWT 토큰에서 추출)
     * @return 생성된 신청서의 상세 정보 DTO
     */
    public JoinApplicationResponseDto createJoinApplication(JoinApplicationRequestDto requestDto, Long userId) {

        // 신청자(User) 엔티티를 DB에서 조회
        User applicant = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 유저를 찾을 수 없습니다: " + userId));

        // 중복 신청 검사
        joinApplicationRepository.findByUser_UserId(userId).ifPresent(existingApplication -> {
            // 이미 신청서가 있다면, 예외(Exception)를 발생
            throw new IllegalStateException("이미 제출한 가입 신청서가 존재합니다. (상태: " + existingApplication.getStatus() + ")");
        });

        // DTO의 toEntity() 헬퍼 메소드를 사용해 JoinApplication 엔티티를 생성
        JoinApplication newApplication = requestDto.toEntity(applicant);

        // Repository를 통해 엔티티를 DB에 저장
        JoinApplication savedApplication = joinApplicationRepository.save(newApplication);

        // 저장된 엔티티를 Response DTO로 변환하여 컨트롤러에 반환
        return new JoinApplicationResponseDto(savedApplication);
    }

    /**
     * 현재 로그인한 사용자의 가입 신청 상태를 조회
     *
     * @param userId 현재 인증된 사용자의 ID
     * @return 신청서 상세 정보 DTO
     */
    @Transactional(readOnly = true)
    public List<JoinApplicationResponseDto> getMyApplications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        return joinApplicationRepository.findAllByUserOrderByCreatedAtDesc(user).stream()
                .map(JoinApplicationResponseDto::new)
                .collect(Collectors.toList());
    }

    /**
     * (관리자용) '대기 중(PENDING)'인 가입 신청 목록을 페이징하여 조회
     *
     * @param pageable 페이징 정보 (page, size, sort)
     * @return 페이징된 신청서 목록 DTO
     */
    @Transactional(readOnly = true)
    public PageResponseDto<JoinApplicationResponseDto> getPendingApplications(Pageable pageable) {

        // Repository에서 PENDING 상태의 신청서만 페이징 조회
        Page<JoinApplication> applicationPage = joinApplicationRepository.findByStatus(JoinStatus.PENDING, pageable);

        // Page<JoinApplication> (엔티티)을 Page<JoinApplicationResponseDto> (DTO)로 변환
        Page<JoinApplicationResponseDto> dtoPage = applicationPage.map(JoinApplicationResponseDto::new);

        // Page<DTO>를 PageResponseDto(범용 DTO)로 감싸서 반환
        return new PageResponseDto<>(dtoPage);
    }

    /**
     * (관리자용) 가입 신청 상태를 '승인' 또는 '거절'로 변경
     *
     * @param joinId     신청서 ID
     * @param requestDto 변경할 상태 (APPROVED or REJECTED)
     * @return 변경된 신청서 정보 DTO
     */
    public JoinApplicationResponseDto updateJoinApplicationStatus(Long joinId, StatusUpdateRequestDto requestDto) {

        // String을 JoinStatus Enum으로 변환
        JoinStatus newStatus;
        try {
            newStatus = JoinStatus.valueOf(requestDto.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("요청 상태(APPROVED/REJECTED)가 올바르지 않습니다.");
        }

        // 신청서 조회
        JoinApplication application = joinApplicationRepository.findById(joinId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 가입 신청서를 찾을 수 없습니다: " + joinId));

        // 신청자(User) 조회
        User applicant = application.getUser();
        String notificationMessage;

        if (newStatus == JoinStatus.APPROVED) {
            // 승인 로직
            application.approve(); // 신청서 상태 변경 (APPROVED)
            applicant.approveAsMember(); // User의 Role을 MEMBER로 변경

            notificationMessage = "축하합니다! 드림쇼콰이어 단원으로 가입이 승인되었습니다.";

            // JoinApplication 정보를 바탕으로 MemberProfile 생성
            // (이미 프로필이 없는지 확인하는 방어 코드)
            if (memberProfileRepository.findById(applicant.getUserId()).isEmpty()) {
                MemberProfile newProfile = MemberProfile.builder()
                        .user(applicant) // @MapsId 관계
                        .part(application.getPart())
                        .interests(application.getInterests())
                        .myDream(application.getMyDream())
                        .hashTags(application.getHashTags())
                        .profileImageKey(application.getProfileImage())
                        .isPublic(true) // 기본값은 공개
                        .build();
                memberProfileRepository.save(newProfile);
            }

        } else if (newStatus == JoinStatus.REJECTED) {
            // 거절 로직
            application.reject(); // 신청서 상태 변경 (REJECTED)
            notificationMessage = "안타깝지만, 단원 가입이 거절되었습니다.";
        } else {
            // PENDING으로 되돌리는 등의 예외 케이스
            throw new IllegalArgumentException("요청 상태(APPROVED/REJECTED)가 올바르지 않습니다.");
        }

        // 신청자에게 알림 생성
        notificationRepository.save(Notification.builder()
                .user(applicant)
                .type(newStatus == JoinStatus.APPROVED ? NotificationType.JOIN_APPROVED : NotificationType.JOIN_REJECTED)
                .message(notificationMessage)
                .build());

        // 변경된 신청서 정보 반환
        return new JoinApplicationResponseDto(application);
    }
}