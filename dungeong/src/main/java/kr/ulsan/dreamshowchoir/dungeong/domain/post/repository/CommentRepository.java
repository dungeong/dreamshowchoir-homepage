package kr.ulsan.dreamshowchoir.dungeong.domain.post.repository;

import kr.ulsan.dreamshowchoir.dungeong.domain.post.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // 특정 게시글(postId)의 모든 댓글 조회 (User 정보 함께 Fetch Join)
    @Query("SELECT c FROM Comment c JOIN FETCH c.user WHERE c.post.postId = :postId AND c.deletedAt IS NULL ORDER BY c.createdAt ASC")
    List<Comment> findAllByPostIdWithUser(Long postId);
}
