package kr.ulsan.dreamshowchoir.dungeong.service;

import jakarta.persistence.EntityNotFoundException;
import kr.ulsan.dreamshowchoir.dungeong.domain.common.MediaType;
import kr.ulsan.dreamshowchoir.dungeong.domain.gallery.Gallery;
import kr.ulsan.dreamshowchoir.dungeong.domain.gallery.GalleryMedia;
import kr.ulsan.dreamshowchoir.dungeong.domain.gallery.GalleryType;
import kr.ulsan.dreamshowchoir.dungeong.domain.gallery.repository.GalleryMediaRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.gallery.repository.GalleryRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.UserRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.common.PageResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.gallery.GalleryCreateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.gallery.GalleryListResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.gallery.GalleryResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.gallery.GalleryUpdateRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class GalleryService {

    private final GalleryRepository galleryRepository;
    private final GalleryMediaRepository galleryMediaRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;

    // ================== (생성) ==================
    public GalleryResponseDto createGallery(GalleryCreateRequestDto requestDto, List<MultipartFile> files, Long userId) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 유저를 찾을 수 없습니다: " + userId));

        // 갤러리 게시글 생성 및 저장
        Gallery newGallery = requestDto.toEntity(author);
        Gallery savedGallery = galleryRepository.save(newGallery);

        // 미디어 파일 업로드 및 저장 (타입 구분 로직 포함)
        uploadMedia(files, savedGallery);

        // 저장된 미디어 목록 조회 및 DTO 반환
        List<GalleryMedia> mediaList = getMediaList(savedGallery);
        return new GalleryResponseDto(savedGallery, mediaList);
    }

    // ================== (조회) ==================
    @Transactional(readOnly = true)
    public PageResponseDto<GalleryListResponseDto> getGalleryList(GalleryType type, Pageable pageable) {
        Page<Gallery> galleryPage;

        // Repository 쿼리에 정렬을 이미 하드코딩 해서, Pageable에서 정렬 정보는 제거하고 나머지만 남겨서 전달
        Pageable unsortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());

        if (type != null) {
            // Enum 객체 대신 .name()으로 문자열 변환해서 전달
            galleryPage = galleryRepository.findByType(type.name(), unsortedPageable);
        } else {
            galleryPage = galleryRepository.findAll(pageable);
        }

        Page<GalleryListResponseDto> dtoPage = galleryPage.map(GalleryListResponseDto::new);
        return new PageResponseDto<>(dtoPage);
    }

    // 상세조회
    @Transactional(readOnly = true)
    public GalleryResponseDto getGalleryDetail(Long galleryId) {
        Gallery gallery = galleryRepository.findByIdWithUserAndMedia(galleryId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 갤러리를 찾을 수 없습니다: " + galleryId));

        // 미디어 목록 함께 조회
        List<GalleryMedia> mediaList = getMediaList(gallery);
        return new GalleryResponseDto(gallery, mediaList);
    }

    // ================== (수정) ==================
    public GalleryResponseDto updateGallery(Long galleryId, GalleryUpdateRequestDto requestDto, List<MultipartFile> files, Long userId) {
        Gallery gallery = galleryRepository.findByIdWithUserAndMedia(galleryId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 갤러리를 찾을 수 없습니다: " + galleryId));

        // 권한 검사
        checkPermission(gallery, userId);

        // 텍스트 내용 수정
        gallery.update(requestDto.getType(), requestDto.getTitle(), requestDto.getDescription());

        // 기존 미디어 삭제 (S3 + DB)
        List<Long> deleteMediaIds = requestDto.getDeleteMediaIds();
        if (deleteMediaIds != null && !deleteMediaIds.isEmpty()) {
            List<GalleryMedia> mediaToDelete = galleryMediaRepository.findAllById(deleteMediaIds);
            for (GalleryMedia media : mediaToDelete) {
                // 본인 게시글의 미디어인지 확인
                if (media.getGallery().getGalleryId().equals(galleryId)) {
                    s3Service.deleteFile(media.getFileKey()); // S3 물리 삭제
                    galleryMediaRepository.delete(media); // DB 물리 삭제
                }
            }
        }

        // 새 미디어 업로드 및 저장
        uploadMedia(files, gallery);

        // 변경사항 반영 및 최신 데이터 조회
        galleryRepository.flush();
        galleryMediaRepository.flush();
        List<GalleryMedia> mediaList = getMediaList(gallery);

        return new GalleryResponseDto(gallery, mediaList);
    }

    // ================== 삭제 ==================
    public void deleteGallery(Long galleryId, Long userId) {
        Gallery gallery = galleryRepository.findByIdWithUserAndMedia(galleryId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 갤러리를 찾을 수 없습니다: " + galleryId));

        // 권한 검사
        checkPermission(gallery, userId);

        // 논리 삭제 (S3 파일은 유지)
        galleryRepository.delete(gallery);
    }


    // ================== Helper Methods ==================

    // 권한 검사 (작성자 본인 또는 관리자)
    private void checkPermission(Gallery gallery, Long userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 유저를 찾을 수 없습니다: " + userId));
        boolean isOwner = gallery.getUser().getUserId().equals(userId);
        boolean isAdmin = currentUser.getRole().equals(Role.ADMIN);
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("이 갤러리를 수정/삭제할 권한이 없습니다.");
        }
    }

    // 미디어 목록 조회 헬퍼
    private List<GalleryMedia> getMediaList(Gallery gallery) {
        return galleryMediaRepository.findAllByGallery(gallery);
    }

    // 미디어 업로드 및 저장 헬퍼
    private void uploadMedia(List<MultipartFile> files, Gallery gallery) {
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                // 파일 타입 판별 (IMAGE 또는 VIDEO)
                MediaType mediaType = determineMediaType(file);
                if (mediaType == null) {
                    log.warn("지원하지 않는 파일 형식입니다. 업로드를 건너뜁니다: {}", file.getOriginalFilename());
                    continue; // 지원하지 않는 타입은 건너뜀
                }

                // S3 업로드 (폴더명: "gallery")
                String mediaUrl = s3Service.uploadFile(file, "gallery");

                // DB 저장
                GalleryMedia galleryMedia = GalleryMedia.builder()
                        .gallery(gallery)
                        .fileKey(mediaUrl)
                        .fileName(file.getOriginalFilename())
                        .mediaType(mediaType)
                        .fileSize(file.getSize())
                        .build();
                galleryMediaRepository.save(galleryMedia);
            }
        }
    }

    // 파일 타입 판별 로직
    private MediaType determineMediaType(MultipartFile file) {
        // 파일의 MIME Type (예: "image/jpeg", "video/mp4")을 확인
        String contentType = file.getContentType();
        if (contentType == null) {
            return null;
        }

        if (contentType.startsWith("image/")) {
            return MediaType.IMAGE;
        } else if (contentType.startsWith("video/")) {
            return MediaType.VIDEO;
        } else {
            // 그 외 타입 (예: pdf, zip 등)은 null 반환
            return null;
        }
    }
}