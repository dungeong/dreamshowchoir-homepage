package kr.ulsan.dreamshowchoir.dungeong.service;

import jakarta.persistence.EntityNotFoundException;
import kr.ulsan.dreamshowchoir.dungeong.domain.banner.Banner;
import kr.ulsan.dreamshowchoir.dungeong.domain.banner.repository.BannerRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.banner.BannerResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.banner.BannerUpdateRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BannerService {

    private final BannerRepository bannerRepository;
    private final S3Service s3Service;

    /**
     * 활성화된 메인 배너 목록 조회
     *
     * @return 배너 목록 DTO 리스트
     */
    @Transactional(readOnly = true)
    public List<BannerResponseDto> getActiveBanners() {
        return bannerRepository.findAllByIsActiveTrueOrderByOrderIndexAsc().stream()
                .map(BannerResponseDto::new)
                .collect(Collectors.toList());
    }

    /**
     * (관리자용) 전체 배너 목록 조회
     *
     * @return 배너 목록 DTO 리스트
     */
    @Transactional(readOnly = true)
    public List<BannerResponseDto> getAllBanners() {
        return bannerRepository.findAllByOrderByOrderIndexAsc().stream()
                .map(BannerResponseDto::new)
                .collect(Collectors.toList());
    }

    /**
     * 배너 생성
     * (기본적으로 활성 상태(isActive=true), 순서 0으로 저장)
     *
     * @param title       배너 제목
     * @param description 배너 설명
     * @param file        배너 이미지 파일
     * @return 생성된 배너 상세 정보 DTO
     */
    public BannerResponseDto createBanner(String title, String description, MultipartFile file) {

        // S3 이미지 업로드
        String imageKey = s3Service.uploadFile(file, "banner");

        Banner banner = Banner.builder()
                .title(title)
                .description(description)
                .imageKey(imageKey)
                .imageName(file.getOriginalFilename())
                .isActive(true) // 기본값 활성
                .orderIndex(0)  // 기본값 0 (맨 앞)
                .build();

        Banner savedBanner = bannerRepository.save(banner);
        return new BannerResponseDto(savedBanner);
    }

    /**
     * 배너 정보 수정 (이미지 교체 포함)
     *
     * @param bannerId   수정할 배너 ID
     * @param requestDto 수정할 텍스트 정보 (제목, 설명, 순서, 활성여부)
     * @param file       교체할 이미지 파일 (null이면 기존 이미지 유지)
     * @return 수정된 배너 정보 DTO
     */
    public BannerResponseDto updateBanner(Long bannerId, BannerUpdateRequestDto requestDto, MultipartFile file) {
        Banner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new EntityNotFoundException("배너를 찾을 수 없습니다: " + bannerId));

        // 이미지 처리 (새 파일이 있는 경우에만 교체)
        String imageKey = banner.getImageKey();
        String imageName = banner.getImageName();

        if (file != null && !file.isEmpty()) {
            // 기존 파일 삭제
            s3Service.deleteFile(banner.getImageKey());
            // 새 파일 업로드
            imageKey = s3Service.uploadFile(file, "banner");
            imageName = file.getOriginalFilename();
        }

        // 정보 업데이트 (Entity 메서드 활용)
        banner.update(imageKey, imageName, requestDto.getTitle(), requestDto.getDescription(), requestDto.getOrderIndex());

        // 활성화 상태 변경 (Entity 메서드 활용)
        if (Boolean.TRUE.equals(requestDto.getIsActive())) {
            banner.activate();
        } else {
            banner.deactivate();
        }

        return new BannerResponseDto(banner);
    }

    /**
     * 배너 삭제
     * (S3 물리 삭제 + DB 논리 삭제)
     *
     * @param bannerId 삭제할 배너 ID
     */
    public void deleteBanner(Long bannerId) {
        Banner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new EntityNotFoundException("배너를 찾을 수 없습니다: " + bannerId));

        // S3 파일 삭제
        s3Service.deleteFile(banner.getImageKey());

        // DB 삭제 (Soft Delete)
        bannerRepository.delete(banner);
    }
}