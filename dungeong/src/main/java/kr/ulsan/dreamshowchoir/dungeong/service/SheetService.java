package kr.ulsan.dreamshowchoir.dungeong.service;

import jakarta.persistence.EntityNotFoundException;
import kr.ulsan.dreamshowchoir.dungeong.domain.sheet.Sheet;
import kr.ulsan.dreamshowchoir.dungeong.domain.sheet.repository.SheetRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.UserRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.common.PageResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.sheet.SheetResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
public class SheetService {

    private final SheetRepository sheetRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;

    /**
     * 새로운 악보를 업로드하고 저장
     * (MEMBER 전용 기능)
     *
     * @param file   업로드할 악보/음원 파일 (MultipartFile)
     * @param userId 현재 인증된 사용자의 ID (JWT 토큰에서 추출)
     * @return 생성된 악보의 상세 정보 DTO
     */
    public SheetResponseDto uploadSheet(MultipartFile file, Long userId) {

        // 업로더(User) 엔티티를 DB에서 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        // S3에 파일을 업로드하고, 저장된 URL(Key)을 반환받음
        String fileKey = s3Service.uploadFile(file, "sheet");

        // Sheet 엔티티 생성 (Builder 패턴 사용)
        Sheet sheet = Sheet.builder()
                .user(user)
                .fileKey(fileKey)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .build();

        // Repository를 통해 엔티티를 DB에 저장
        Sheet savedSheet = sheetRepository.save(sheet);

        // 저장된 엔티티를 Response DTO로 변환하여 반환
        return new SheetResponseDto(savedSheet);
    }

    /**
     * 악보 목록을 페이징하여 조회
     *
     * @param pageable "page", "size", "sort" 파라미터를 담은 객체
     * @return 페이징 정보와 악보 목록 DTO (PageResponseDto)
     */
    @Transactional(readOnly = true)
    public PageResponseDto<SheetResponseDto> getSheetList(Pageable pageable) {

        // Repository에서 전체 악보 목록을 페이징 조회
        Page<Sheet> sheetPage = sheetRepository.findAll(pageable);

        // Page<Sheet> (엔티티)를 Page<SheetResponseDto> (DTO)로 변환
        Page<SheetResponseDto> dtoPage = sheetPage.map(SheetResponseDto::new);

        // 범용 페이징 DTO로 감싸서 반환
        return new PageResponseDto<>(dtoPage);
    }

    /**
     * 악보 1건을 (논리) 삭제
     * (S3 파일은 물리 삭제됨)
     *
     * @param sheetId 삭제할 악보의 ID
     * @param userId  현재 인증된 사용자의 ID (JWT 토큰에서 추출)
     */
    public void deleteSheet(Long sheetId, Long userId) {

        // 삭제할 악보를 DB에서 조회
        Sheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new EntityNotFoundException("악보를 찾을 수 없습니다: " + sheetId));

        // 권한 검사를 위해 현재 사용자 정보를 DB에서 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        // 작성자 본인이거나 관리자(ADMIN)가 아니면, 권한 없음 예외 발생
        boolean isOwner = sheet.getUser().getUserId().equals(userId);
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("삭제 권한이 없습니다.");
        }

        // S3에서 실제 파일 삭제 (물리 삭제)
        s3Service.deleteFile(sheet.getFileKey());

        // Repository의 delete() 호출 -> @SQLDelete(논리삭제) 쿼리 실행
        sheetRepository.delete(sheet);
    }
}