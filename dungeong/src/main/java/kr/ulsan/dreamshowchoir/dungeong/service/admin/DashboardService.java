package kr.ulsan.dreamshowchoir.dungeong.service.admin;

import kr.ulsan.dreamshowchoir.dungeong.domain.communicate.InquiryStatus;
import kr.ulsan.dreamshowchoir.dungeong.domain.communicate.repository.InquiryRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.donation.DonationStatus;
import kr.ulsan.dreamshowchoir.dungeong.domain.donation.repository.DonationRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.Post;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.repository.PostRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.JoinStatus;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.JoinApplicationRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.UserRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.ScheduleDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.admin.DashboardDto;
import kr.ulsan.dreamshowchoir.dungeong.service.GoogleCalendarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final JoinApplicationRepository joinApplicationRepository;
    private final InquiryRepository inquiryRepository;
    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final GoogleCalendarService googleCalendarService;

    public DashboardDto getDashboardData() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth()).withHour(0).withMinute(0)
                .withSecond(0).withNano(0);
        LocalDateTime endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth()).withHour(23).withMinute(59)
                .withSecond(59).withNano(999999999);

        // 처리 대기중인 작업
        long pendingJoins = joinApplicationRepository.countByStatus(JoinStatus.PENDING);
        long pendingInquiries = inquiryRepository.countByStatus(InquiryStatus.PENDING);
        long pendingDonations = donationRepository.countByStatus(DonationStatus.PENDING);

        // 통계
        long totalMembers = userRepository.countByRoleNot(Role.GUEST);
        long monthlyDonationAmount = donationRepository.sumCompletedAmountBetween(startOfMonth, endOfMonth);
        long newMembersCount = userRepository.countByCreatedAtBetween(startOfMonth, endOfMonth);

        // 다가오는 일정 ('practice' 및 'performance' 캘린더에서 모두 가져오기)
        List<ScheduleDto> upcomingSchedules = new ArrayList<>();
        try {

            // 현재 달의 연습 및 공연 일정을 가져옵니다.
            List<ScheduleDto> practiceEvents = new ArrayList<>(googleCalendarService.getEvents("practice", now.getYear(), now.getMonthValue()));
            List<ScheduleDto> performanceEvents = new ArrayList<>(googleCalendarService.getEvents("performance", now.getYear(), now.getMonthValue()));

            // "다가오는" 일정을 확실히 포함하기 위해 다음 달의 일정도 가져옵니다.
            LocalDateTime nextMonth = now.plusMonths(1);
            practiceEvents.addAll(
                    googleCalendarService.getEvents("practice", nextMonth.getYear(), nextMonth.getMonthValue()));
            performanceEvents.addAll(
                    googleCalendarService.getEvents("performance", nextMonth.getYear(), nextMonth.getMonthValue()));

            upcomingSchedules.addAll(practiceEvents);
            upcomingSchedules.addAll(performanceEvents);

            // 지난 이벤트를 필터링하고, 시작 시간순으로 정렬한 후, 최대 5개의 향후 일정을 선택합니다.
            upcomingSchedules = upcomingSchedules.stream()
                    .filter(s -> s.getStart().isAfter(now) || s.getEnd().isAfter(now))
                    .sorted(Comparator.comparing(ScheduleDto::getStart))
                    .limit(5)
                    .collect(Collectors.toList());

        } catch (IOException e) {
            log.error("대시보드용 구글 캘린더 이벤트를 가져오는데 실패했습니다.", e);
            // 오류 발생 시 빈 목록을 반환합니다.
        }

        // 최신 게시물
        List<Post> recentPostEntities = postRepository
                .findTop5ByDeletedAtIsNullOrderByCreatedAtDesc(PageRequest.of(0, 5));
        List<DashboardDto.LatestPostDto> recentPosts = recentPostEntities.stream()
                .map(p -> DashboardDto.LatestPostDto.builder()
                        .postId(p.getPostId())
                        .title(p.getTitle())
                        .authorName(p.getUser() != null ? p.getUser().getName() : "알 수 없음")
                        .createdAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return DashboardDto.builder()
                .pendingJoins(pendingJoins)
                .pendingInquiries(pendingInquiries)
                .pendingDonations(pendingDonations)
                .totalMembers(totalMembers)
                .monthlyDonationAmount(monthlyDonationAmount)
                .newMembersCount(newMembersCount)
                .upcomingSchedules(upcomingSchedules)
                .recentPosts(recentPosts)
                .build();
    }
}
