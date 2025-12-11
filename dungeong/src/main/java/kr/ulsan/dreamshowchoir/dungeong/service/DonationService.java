package kr.ulsan.dreamshowchoir.dungeong.service;

import jakarta.persistence.EntityNotFoundException;
import kr.ulsan.dreamshowchoir.dungeong.domain.donation.Donation;
import kr.ulsan.dreamshowchoir.dungeong.domain.donation.DonationStatus;
import kr.ulsan.dreamshowchoir.dungeong.domain.donation.repository.DonationRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.notification.NotificationType;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.UserRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.common.PageResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.common.StatusUpdateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.donation.DonationRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.donation.DonationResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.donation.DonorResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * 새로운 후원 신청을 생성
     *
     * @param requestDto 후원 금액, 타입 DTO
     * @param userId     현재 인증된 사용자의 ID (JWT 토큰에서 추출)
     * @return 생성된 후원 신청의 상세 정보 DTO
     */
    public DonationResponseDto createDonation(DonationRequestDto requestDto, Long userId) {

        // 후원자(User) 엔티티를 DB에서 조회
        User donator = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 유저를 찾을 수 없습니다: " + userId));

        // DTO의 toEntity() 헬퍼 메소드를 사용해 Donation 엔티티를 생성
        Donation newDonation = requestDto.toEntity(donator);

        // Repository를 통해 엔티티를 DB에 저장합니다.
        Donation savedDonation = donationRepository.save(newDonation);

        // 저장된 엔티티를 Response DTO로 변환하여 컨트롤러에 반환
        return new DonationResponseDto(savedDonation);
    }

    /**
     * 현재 로그인한 사용자의 '내 후원 내역' 목록을 조회
     *
     * @param userId 현재 인증된 사용자의 ID
     * @return 후원 내역 DTO 리스트
     */
    @Transactional(readOnly = true) // 조회(SELECT) 전용
    public List<DonationResponseDto> getMyDonations(Long userId) {

        // Repository에서 Fetch Join이 적용된 쿼리 호출
        List<Donation> donations = donationRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);

        // List<Donation> (엔티티)를 List<DonationResponseDto> (DTO)로 변환
        return donations.stream()
                .map(DonationResponseDto::new) // (donation -> new DonationResponseDto(donation))
                .collect(Collectors.toList());
    }

    /**
     * (관리자용) 특정 상태(Pending, Completed 등)의 후원 목록을 페이징하여 조회
     *
     * @param status   조회할 상태 (e.g., PENDING)
     * @param pageable 페이징 정보
     * @return 페이징된 후원 목록 DTO
     */
    @Transactional(readOnly = true)
    public PageResponseDto<DonationResponseDto> getDonationListByStatus(DonationStatus status, Pageable pageable) {

        // Repository에서 상태별 페이징 조회
        Page<Donation> donationPage = donationRepository.findByStatus(status, pageable);

        // Page<Donation> (엔티티) -> Page<DonationResponseDto> (DTO) 변환
        Page<DonationResponseDto> dtoPage = donationPage.map(DonationResponseDto::new);

        // PageResponseDto(범용 DTO)로 감싸서 반환
        return new PageResponseDto<>(dtoPage);
    }

    /**
     * (관리자용) 후원 신청 상태를 '완료' 또는 '실패'로 변경
     *
     * @param donationId 후원 신청 ID
     * @param requestDto 변경할 상태 (COMPLETED or FAILED)
     * @return 변경된 후원 신청 정보 DTO
     */
    public DonationResponseDto updateDonationStatus(Long donationId, StatusUpdateRequestDto requestDto) {

        // String을 DonationStatus Enum으로 변환
        DonationStatus newStatus;
        try {
            newStatus = DonationStatus.valueOf(requestDto.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("요청 상태(COMPLETED/FAILED)가 올바르지 않습니다.");
        }

        // 후원 신청서 조회
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 후원 신청을 찾을 수 없습니다: " + donationId));

        User donator = donation.getUser();
        String notificationMessage;
        NotificationType notificationType;

        if (newStatus == DonationStatus.COMPLETED) {
            // 완료
            donation.markAsCompleted();
            notificationType = NotificationType.DONATION_APPROVED;
            notificationMessage = "신청하신 후원이 정상적으로 완료되었습니다. 감사합니다.";
        } else if (newStatus == DonationStatus.FAILED) {
            // 실패
            donation.markAsFailed();
            notificationType = NotificationType.DONATION_REJECTED;
            notificationMessage = "신청하신 후원 처리에 실패하였습니다. 관리자에게 문의해주세요.";
        } else {
            // PENDING으로 되돌리는 등의 예외 케이스
            throw new IllegalArgumentException("요청 상태(COMPLETED/FAILED)가 올바르지 않습니다.");
        }

        if (donator != null) {
            // 후원자에게 알림 생성
            notificationService.createNotification(donator, notificationType, notificationMessage);
        } else {
            log.info("탈퇴한 회원의 후원 처리(ID: {}", donationId);
        }
        // 변경된 후원 정보 반환
        return new DonationResponseDto(donation);
    }

    /**
     * 후원 완료자 목록 조회
     * (전체 공개)
     */
    @Transactional(readOnly = true)
    public List<DonorResponseDto> getDonorsHallOfFame() {
        return donationRepository.findAllCompletedDonations().stream()
                .map(d -> {
                    // ★ 여기서 유저가 null인지 체크해야 뻗지 않습니다!
                    String donorName = (d.getUser() != null) ? d.getUser().getName() : null;
                    return new DonorResponseDto(d);
                })
                .collect(Collectors.toList());
    }
}