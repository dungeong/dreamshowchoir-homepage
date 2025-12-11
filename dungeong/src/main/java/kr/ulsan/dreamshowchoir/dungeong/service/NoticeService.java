package kr.ulsan.dreamshowchoir.dungeong.service;

import jakarta.persistence.EntityNotFoundException;
import kr.ulsan.dreamshowchoir.dungeong.domain.notice.Notice;
import kr.ulsan.dreamshowchoir.dungeong.domain.notice.NoticeImage;
import kr.ulsan.dreamshowchoir.dungeong.domain.notice.repository.NoticeImageRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.notice.repository.NoticeRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.UserRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.common.PageResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.notice.NoticeCreateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.notice.NoticeListResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.notice.NoticeResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.notice.NoticeUpdateRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.awt.*;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;
    private final NoticeImageRepository noticeImageRepository;
    private final S3Service s3Service;

    /**
     * (공통 메소드) 해당 유저가 ADMIN인지 확인하는 헬퍼 메소드
     */
    private User checkAdminAuthority(Long userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 유저를 찾을 수 없습니다: " + userId));

        if (!currentUser.getRole().equals(Role.ADMIN)) {
            throw new AccessDeniedException("이 작업을 수행할 권한(ADMIN)이 없습니다.");
        }

        return currentUser;
    }

    /**
     * 새로운 공지사항을 생성 (ADMIN 전용)
     *
     * @param requestDto 공지사항 제목, 내용 DTO
     * @param userId     현재 인증된 사용자의 ID (JWT 토큰에서 추출)
     * @return 생성된 공지사항의 상세 정보 DTO
     */
    public NoticeResponseDto createNotice(NoticeCreateRequestDto requestDto, List<MultipartFile> files, Long userId) {

        // 작성자(User) 엔티티를 DB에서 조회
        User author = checkAdminAuthority(userId);

        // DTO의 toEntity() 헬퍼 메소드를 사용해 Notice 엔티티를 생성
        Notice newNotice = requestDto.toEntity(author);

        // Repository를 통해 엔티티를 DB에 저장
        Notice savedNotice = noticeRepository.save(newNotice);

        // 이미지 업로드 및 저장
        uploadImages(files, savedNotice);

        noticeImageRepository.flush();

        // 저장된 엔티티를 Response DTO로 변환하여 컨트롤러에 반환
        return new NoticeResponseDto(savedNotice);
    }


    /**
     * 공지사항 목록 조회 (MEMBER 이상)
     *
     * @param pageable "page", "size", "sort" 파라미터를 담은 객체
     * @return 페이징 정보와 공지사항 목록 DTO
     */
    @Transactional(readOnly = true)
    public PageResponseDto<NoticeListResponseDto> getNoticeList(Pageable pageable) {

        // Repository에서 Fetch Join이 적용된 쿼리 호출
        Page<Notice> noticePage = noticeRepository.findAllWithUser(pageable);

        // Page<Notice> (엔티티) -> Page<NoticeListResponseDto> (DTO) 변환
        Page<NoticeListResponseDto> dtoPage = noticePage.map(NoticeListResponseDto::new);

        // PageResponseDto(범용 DTO)로 감싸서 반환
        return new PageResponseDto<>(dtoPage);
    }


    /**
     * 공지사항 상세 조회 (MEMBER 이상)
     *
     * @param noticeId 조회할 공지사항의 ID
     * @return 공지사항 상세 정보 DTO
     */
    @Transactional(readOnly = true)
    public NoticeResponseDto getNoticeDetail(Long noticeId) {

        // Repository에서 Fetch Join 쿼리(findByIdWithUser)를 호출
        Notice notice = noticeRepository.findByIdWithUser(noticeId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 공지사항을 찾을 수 없습니다: " + noticeId));

        // Notice 엔티티를 NoticeResponseDto(상세 DTO)로 변환하여 반환
        return new NoticeResponseDto(notice);
    }

    /**
     * 공지사항 수정 (ADMIN 전용)
     *
     * @param noticeId   수정할 공지사항의 ID
     * @param requestDto 수정할 제목, 내용 DTO
     * @param files      새로 추가할 이미지 파일 리스트
     * @return 수정된 공지사항의 상세 정보 DTO
     */
    public NoticeResponseDto updateNotice(Long noticeId, NoticeUpdateRequestDto requestDto, List<MultipartFile> files) {

        // 공지사항 조회
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 공지사항을 찾을 수 없습니다: " + noticeId));

        // 엔티티 내용 변경
        notice.update(requestDto.getTitle(), requestDto.getContent());

        // 기존 이미지 삭제 로직
        List<Long> deleteImageIds = requestDto.getDeleteImageIds();
        if (deleteImageIds != null && !deleteImageIds.isEmpty()) {
            List<NoticeImage> imagesToDelete = noticeImageRepository.findAllById(deleteImageIds);

            for (NoticeImage image : imagesToDelete) {
                // 해당 공지사항의 이미지가 맞는지 안전장치
                if (!image.getNotice().getNoticeId().equals(noticeId)) {
                    continue;
                }
                // S3 물리 삭제
                s3Service.deleteFile(image.getImageKey());

                // DB 삭제
                noticeImageRepository.delete(image);
            }
        }

        // 새 이미지 업로드
        uploadImages(files, notice);

        // updatedAt 갱신을 위해 flush() 호출
        noticeRepository.flush();
        noticeImageRepository.flush();

        // 변경된 엔티티를 DTO로 변환하여 반환
        return new NoticeResponseDto(notice);
    }


    /**
     * 공지사항 삭제(ADMIN 전용)
     *
     * @param noticeId 삭제할 공지사항의 ID
     * @param userId   현재 인증된 사용자의 ID (권한 검사용)
     */
    public void deleteNotice(Long noticeId, Long userId) {

        // (권한 검사) ADMIN인지 확인
        checkAdminAuthority(userId);

        // 공지사항 조회 (삭제할 대상 확인)
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 공지사항을 찾을 수 없습니다: " + noticeId));

        // 연결된 이미지 S3에서 모두 삭제
        for (NoticeImage image : notice.getNoticeImages()) {
            s3Service.deleteFile(image.getImageKey());
        }

        // Repository의 delete() 호출 -> @SQLDelete(논리삭제) 쿼리 실행
        noticeRepository.delete(notice);
    }

    // 이미지 업로드 로직
    private void uploadImages(List<MultipartFile> files, Notice notice) {
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                // S3 업로드 (폴더명: "notice")
                String imageKey = s3Service.uploadFile(file, "notice");

                NoticeImage noticeImage = NoticeImage.builder()
                        .notice(notice)
                        .imageName(file.getOriginalFilename())
                        .imageKey(imageKey)
                        .fileSize(file.getSize())
                        .build();

                noticeImageRepository.save(noticeImage);

                notice.getNoticeImages().add(noticeImage);
            }
        }
    }

}