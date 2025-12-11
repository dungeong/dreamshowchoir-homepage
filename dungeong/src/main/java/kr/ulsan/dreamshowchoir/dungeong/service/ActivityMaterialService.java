package kr.ulsan.dreamshowchoir.dungeong.service;

import jakarta.persistence.EntityNotFoundException;
import kr.ulsan.dreamshowchoir.dungeong.domain.activity.ActivityMaterial;
import kr.ulsan.dreamshowchoir.dungeong.domain.activity.repository.ActivityMaterialRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.UserRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.activity.ActivityMaterialCreateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.activity.ActivityMaterialResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.activity.ActivityMaterialUpdateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.common.PageResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
public class ActivityMaterialService {

    private final ActivityMaterialRepository materialRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;

    /**
     * 활동자료 생성
     * (관리자 ADMIN 전용 기능)
     *
     * @param requestDto 자료 제목, 내용 DTO
     * @param file       업로드할 파일
     * @param userId     현재 인증된 관리자의 ID
     * @return 생성된 활동자료 상세 정보 DTO
     */
    public ActivityMaterialResponseDto createMaterial(ActivityMaterialCreateRequestDto requestDto, MultipartFile file, Long userId) {

        // 작성자(관리자) 엔티티를 DB에서 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        // S3에 파일을 업로드하고, 저장된 URL(Key)을 반환받음
        String fileKey = s3Service.uploadFile(file, "activity");

        // DTO의 헬퍼 메소드(toEntity)를 사용하여 ActivityMaterial 엔티티 생성
        ActivityMaterial material = requestDto.toEntity(
                user,
                fileKey,
                file.getOriginalFilename(),
                file.getSize()
        );

        // Repository를 통해 엔티티를 DB에 저장
        ActivityMaterial savedMaterial = materialRepository.save(material);

        // 저장된 엔티티를 Response DTO로 변환하여 반환
        return new ActivityMaterialResponseDto(savedMaterial);
    }

    /**
     * 활동자료 목록을 페이징하여 조회
     * (전체 공개)
     *
     * @param pageable "page", "size", "sort" 파라미터를 담은 객체
     * @return 페이징 정보와 활동자료 목록 DTO (PageResponseDto)
     */
    @Transactional(readOnly = true)
    public PageResponseDto<ActivityMaterialResponseDto> getMaterialList(Pageable pageable) {

        // Repository에서 전체 자료 목록을 페이징 조회
        Page<ActivityMaterial> materialPage = materialRepository.findAll(pageable);

        // Page<Entity>를 Page<DTO>로 변환
        Page<ActivityMaterialResponseDto> dtoPage = materialPage.map(ActivityMaterialResponseDto::new);

        // 범용 페이징 DTO로 감싸서 반환
        return new PageResponseDto<>(dtoPage);
    }

    /**
     * 활동자료 상세 조회
     * (전체 공개)
     *
     * @param materialId 조회할 자료의 ID
     * @return 활동자료 상세 정보 DTO
     */
    @Transactional(readOnly = true)
    public ActivityMaterialResponseDto getMaterialDetail(Long materialId) {

        // DB에서 해당 ID의 자료 조회
        ActivityMaterial material = materialRepository.findById(materialId)
                .orElseThrow(() -> new EntityNotFoundException("자료를 찾을 수 없습니다: " + materialId));

        // 조회된 엔티티를 DTO로 변환하여 반환
        return new ActivityMaterialResponseDto(material);
    }

    /**
     * 활동자료의 텍스트 정보(제목, 내용)를 수정
     * (파일 수정은 지원하지 않음)
     *
     * @param materialId 수정할 자료의 ID
     * @param requestDto 수정할 제목, 내용 DTO
     */
    public ActivityMaterialResponseDto updateMaterial(Long materialId, ActivityMaterialUpdateRequestDto requestDto) {

        // DB에서 수정할 자료 조회
        ActivityMaterial material = materialRepository.findById(materialId)
                .orElseThrow(() -> new EntityNotFoundException("자료를 찾을 수 없습니다: " + materialId));

        // 엔티티의 update() 메소드 호출 (Dirty Checking을 통해 트랜잭션 종료 시 자동 UPDATE)
        material.update(requestDto.getTitle(), requestDto.getDescription());

        // 수정된 엔티티를 바로 DTO로 변환하여 반환
        return new ActivityMaterialResponseDto(material);
    }

    /**
     * 활동자료 (논리) 삭제
     * (S3 파일은 물리 삭제됨)
     *
     * @param materialId 삭제할 자료의 ID
     */
    public void deleteMaterial(Long materialId) {

        // DB에서 삭제할 자료 조회
        ActivityMaterial material = materialRepository.findById(materialId)
                .orElseThrow(() -> new EntityNotFoundException("자료를 찾을 수 없습니다: " + materialId));

        // S3에서 실제 파일 삭제 (물리 삭제)
        s3Service.deleteFile(material.getFileKey());

        // Repository의 delete() 호출 -> @SQLDelete(논리삭제) 쿼리 실행
        materialRepository.delete(material);
    }
}