package kr.ulsan.dreamshowchoir.dungeong.dto.admin;

import kr.ulsan.dreamshowchoir.dungeong.dto.ScheduleDto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class DashboardDto {

    // 대기중인 작업
    private long pendingJoins;
    private long pendingInquiries;
    private long pendingDonations;

    // 통계
    private long totalMembers;
    private long monthlyDonationAmount;
    private long newMembersCount;

    // 다가오는 일정
    private List<ScheduleDto> upcomingSchedules;

    // 최근 게시글
    private List<LatestPostDto> recentPosts;

    @Getter
    @Builder
    public static class LatestPostDto {
        private Long postId;
        private String title;
        private String authorName;
        private LocalDateTime createdAt;
    }
}
