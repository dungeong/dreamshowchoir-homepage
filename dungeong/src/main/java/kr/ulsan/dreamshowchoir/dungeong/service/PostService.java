package kr.ulsan.dreamshowchoir.dungeong.service;

import jakarta.persistence.EntityNotFoundException;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.Post;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.PostImage;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.repository.PostImageRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.post.repository.PostRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.UserRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.common.PageResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.post.PostCreateRequestDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.post.PostListResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.post.PostResponseDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.post.PostUpdateRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor // final 필드 생성자 자동 주입
@Transactional // 클래스 레벨에 트랜잭션 선언 (모든 public 메소드에 적용)
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostImageRepository postImageRepository;
    private final S3Service s3Service;

    /**
     * 새로운 게시글 생성
     *
     * @param requestDto 게시글 제목, 내용 DTO
     * @param userId     현재 인증된 사용자의 ID (JWT 토큰에서 추출)
     * @return 생성된 게시글의 상세 정보 DTO
     */
    public PostResponseDto createPost(PostCreateRequestDto requestDto, List<MultipartFile> files, Long userId) {

        // 작성자(User) 엔티티를 DB에서 조회
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 유저를 찾을 수 없습니다: " + userId));

        // DTO의 toEntity() 헬퍼 메소드를 사용해 Post 엔티티를 생성
        Post newPost = requestDto.toEntity(author);

        // Repository를 통해 엔티티를 DB에 저장
        Post savedPost = postRepository.save(newPost);

        // 파일 업로드 및 PostImage 저장
        uploadImages(files, savedPost);

        postImageRepository.flush();

        // 저장된 엔티티를 Response DTO로 변환하여 컨트롤러에 반환
        return new PostResponseDto(savedPost);
    }

    /**
     * 게시글 목록을 페이징하여 조회
     *
     * @param pageable "page", "size", "sort" 파라미터를 담은 객체
     * @return 페이징 정보와 게시글 목록 DTO
     */
    @Transactional(readOnly = true) // 조회(SELECT)만 하므로 readOnly = true (성능 최적화)
    public PageResponseDto<PostListResponseDto> getPostList(Pageable pageable) {

        // Repository에서 Fetch Join이 적용된 쿼리 호출
        // (N+1 문제 방지: Post 조회 시 User(authorName)도 함께 조회)
        Page<Post> postPage = postRepository.findAllWithUser(pageable);

        // Page<Post> (엔티티)를 Page<PostListResponseDto> (DTO)로 변환
        // .map()은 Page 객체가 제공하는 변환 기능
        Page<PostListResponseDto> dtoPage = postPage.map(PostListResponseDto::new);

        // Page<DTO>를 우리가 만든 PageResponseDto(범용 DTO)로 감싸서 반환
        return new PageResponseDto<>(dtoPage);
    }

    /**
     * 게시글 1건 상세 조회
     *
     * @param postId 조회할 게시글의 ID
     * @return 게시글 상세 정보 DTO
     */
    @Transactional(readOnly = true)
    public PostResponseDto getPostDetail(Long postId) {

        // Repository에서 Fetch Join 쿼리(findByIdWithUser)를 호출
        Post post = postRepository.findByIdWithUser(postId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 게시글을 찾을 수 없습니다: " + postId));

        // Post 엔티티를 PostResponseDto(상세 DTO)로 변환하여 반환
        return new PostResponseDto(post);
    }

    /**
     * 게시글 수정
     *
     * @param postId     수정할 게시글의 ID
     * @param requestDto 수정할 제목, 내용 DTO
     * @param userId     현재 인증된 사용자의 ID (JWT 토큰에서 추출)
     * @return 수정된 게시글의 상세 정보 DTO
     */
    public PostResponseDto updatePost(Long postId, PostUpdateRequestDto requestDto, List<MultipartFile> files, Long userId) {

        // DB에서 게시글 조회 (User 정보 포함)
        Post post = postRepository.findByIdWithUser(postId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 게시글을 찾을 수 없습니다: " + postId));

        // 권한 검사 - 게시글 작성자의 ID와 현재 로그인한 사용자의 ID가 동일한지 확인
        if (!post.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("이 게시글을 수정할 권한이 없습니다.");
        }

        // 텍스트 내용 수정
        post.update(requestDto.getTitle(), requestDto.getContent());

        // 기존 이미지 삭제 로직
        List<Long> deleteImageIds = requestDto.getDeleteImageIds();
        if (deleteImageIds != null && !deleteImageIds.isEmpty()) {
            List<PostImage> imagesToDelete = postImageRepository.findAllById(deleteImageIds);

            for (PostImage image : imagesToDelete) {
                // 이 이미지가 현재 게시글의 이미지가 맞는지 확인
                if (!image.getPost().getPostId().equals(postId)) {
                    continue;
                }

                // S3에서 파일 삭제
                s3Service.deleteFile(image.getImageKey());

                // DB에서 삭제
                postImageRepository.delete(image);
            }
        }

        // 새 이미지 업로드
        uploadImages(files, post);

        // DB에 변경 사항을 즉시 강제 실행
        postRepository.flush();
        postImageRepository.flush();    // 이미지 삭제/추가

        return new PostResponseDto(post);
    }


    /**
     * 게시글 1건을 (논리) 삭제
     *
     * @param postId 삭제할 게시글의 ID
     * @param userId 현재 인증된 사용자의 ID (JWT 토큰에서 추출)
     */
    public void deletePost(Long postId, Long userId) {

        // 게시글을 DB에서 조회 (작성자 정보 포함)
        Post post = postRepository.findByIdWithUser(postId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 게시글을 찾을 수 없습니다: " + postId));

        // 권한 검사 (현재 요청한 사용자가 ADMIN인지 확인하기 위해, 현재 사용자 정보도 조회)
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 유저를 찾을 수 없습니다: " + userId));

        // 작성자 본인이거나 관리자(ADMIN)가 아니면, 권한 없음 예외 발생
        boolean isOwner = post.getUser().getUserId().equals(userId);
        boolean isAdmin = currentUser.getRole().equals(Role.ADMIN);

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("이 게시글을 삭제할 권한이 없습니다.");
        }

        // Repository의 delete() 호출 -> @SQLDelete(논리삭제) 쿼리 실행
        postRepository.delete(post);
    }

    // 공통 이미지 업로드 메소드
    private void uploadImages(List<MultipartFile> files, Post post) {
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                // S3에 업로드 (폴더명: "post")
                String imageUrl = s3Service.uploadFile(file, "post");

                // PostImage 엔티티 생성
                PostImage postImage = PostImage.builder()
                        .post(post)
                        .imageName(file.getOriginalFilename())
                        .imageKey(imageUrl)
                        .fileSize(file.getSize())
                        .build();

                // DB 저장
                postImageRepository.save(postImage);
            }
        }
    }
}