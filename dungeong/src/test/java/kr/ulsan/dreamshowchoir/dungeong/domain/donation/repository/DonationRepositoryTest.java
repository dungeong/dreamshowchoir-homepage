package kr.ulsan.dreamshowchoir.dungeong.domain.donation.repository;

import kr.ulsan.dreamshowchoir.dungeong.config.JpaAuditingConfig;
import kr.ulsan.dreamshowchoir.dungeong.domain.donation.Donation;
import kr.ulsan.dreamshowchoir.dungeong.domain.donation.DonationStatus; // Enum import
import kr.ulsan.dreamshowchoir.dungeong.domain.donation.DonationType;   // Enum import
import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // PostgreSQL 사용
@Import(JpaAuditingConfig.class) // Auditing 기능(createdAt) 활성화
class DonationRepositoryTest {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private UserRepository userRepository; // Donation은 User에 의존

    private User savedTestUser; // 후원자

    @BeforeEach
    void setUp() {
        // 1. User 저장
        User testUser = User.builder()
                .name("후원자A")
                .email("donator@example.com")
                .oauthProvider("google")
                .oauthId("google_donator_123")
                .role(Role.USER)
                .build();
        savedTestUser = userRepository.saveAndFlush(testUser);
    }

    @Test
    @DisplayName("새로운 Donation을 저장하고 ID로 조회하면 성공")
    void saveAndFindDonationTest() {
        // given (준비)
        Donation newDonation = Donation.builder()
                .user(savedTestUser)
                .amount(50000L)
                .type(DonationType.ONE_TIME)
                .build();

        // when (실행)
        Donation savedDonation = donationRepository.save(newDonation);

        // then (검증)
        Donation foundDonation = donationRepository.findById(savedDonation.getDonationId()).orElseThrow();

        assertThat(foundDonation.getDonationId()).isEqualTo(savedDonation.getDonationId());
        assertThat(foundDonation.getAmount()).isEqualTo(50000L);
        assertThat(foundDonation.getType()).isEqualTo(DonationType.ONE_TIME);
        assertThat(foundDonation.getStatus()).isEqualTo(DonationStatus.PENDING); // 기본 상태 PENDING 검증
        assertThat(foundDonation.getUser().getName()).isEqualTo("후원자A"); // 연관관계 조회
        assertThat(foundDonation.getCreatedAt()).isNotNull(); // Auditing 검증
    }

    @Test
    @DisplayName("특정 유저의 후원 내역을 최신순으로 조회함")
    void findByUser_UserIdOrderByCreatedAtDescTest() {
        // given (준비) - 2개의 후원 기록 저장 (시간차를 두기 위해 flush 사용)
        Donation donation1 = donationRepository.saveAndFlush(Donation.builder()
                .user(savedTestUser)
                .amount(10000L)
                .type(DonationType.ONE_TIME)
                .build());

        // (시간차를 두기 위해 약간의 대기 또는 flush 후 재저장)
        Donation donation2 = donationRepository.saveAndFlush(Donation.builder()
                .user(savedTestUser)
                .amount(30000L)
                .type(DonationType.REGULAR)
                .build());

        // when (실행)
        List<Donation> donations = donationRepository.findByUser_UserIdOrderByCreatedAtDesc(savedTestUser.getUserId());

        // then (검증)
        assertThat(donations).hasSize(2);
        assertThat(donations.get(0).getDonationId()).isEqualTo(donation2.getDonationId()); // 최신(donation2)이 먼저인지
        assertThat(donations.get(0).getAmount()).isEqualTo(30000L);
        assertThat(donations.get(1).getAmount()).isEqualTo(10000L);
    }

    @Test
    @DisplayName("후원 상태 변경(update)이 정상 동작함")
    void updateStatusTest() {
        // given (준비)
        Donation newDonation = Donation.builder()
                .user(savedTestUser)
                .amount(10000L)
                .type(DonationType.ONE_TIME)
                .build();
        Donation savedDonation = donationRepository.save(newDonation);
        assertThat(savedDonation.getStatus()).isEqualTo(DonationStatus.PENDING); // 최초 상태 PENDING

        // when (실행) - 상태 변경 (엔티티의 편의 메소드 사용)
        savedDonation.markAsCompleted();
        donationRepository.saveAndFlush(savedDonation); // 변경 사항 DB 반영

        // then (검증)
        Donation foundDonation = donationRepository.findById(savedDonation.getDonationId()).orElseThrow();
        assertThat(foundDonation.getStatus()).isEqualTo(DonationStatus.COMPLETED); // COMPLETED로 변경되었는지
    }
}