package kr.ulsan.dreamshowchoir.dungeong.domain.post.repository;

import kr.ulsan.dreamshowchoir.dungeong.domain.post.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    /**
     * 게시글 목록 조회 (최신순) 킻 페이징
     */
    @Query("SELECT p FROM Post p JOIN FETCH p.user WHERE p.deletedAt IS NULL ORDER BY p.createdAt DESC")
    Page<Post> findAllWithUser(Pageable pageable);

    /**
     * 게시글 상세 조회 (N+1 방지를 위해 User와 Fetch Join)
     */
    @Query("SELECT p FROM Post p JOIN FETCH p.user WHERE p.postId = :postId AND p.deletedAt IS NULL")
    Optional<Post> findByIdWithUser(Long postId);

    /**
     * 최근 게시글 5개 조회 (관리자 대시보드용)
     */
    @Query("SELECT p FROM Post p JOIN FETCH p.user WHERE p.deletedAt IS NULL ORDER BY p.createdAt DESC")
    java.util.List<Post> findTop5ByDeletedAtIsNullOrderByCreatedAtDesc(Pageable pageable);
}
