package kr.ulsan.dreamshowchoir.dungeong.domain.gallery.repository;

import kr.ulsan.dreamshowchoir.dungeong.domain.gallery.Gallery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface GalleryRepository extends JpaRepository<Gallery, Long> {
    /**
     * 목록 전체 조회 (Type 필터 없음)
     * @EntityGraph: "user" 필드를 같이 가져와라 (LEFT JOIN FETCH와 동일 효과)
     * 메서드 이름 : findAll -> 전체 조회
     */
    @EntityGraph(attributePaths = {"user"})
    Page<Gallery> findAll(Pageable pageable);

    /**
     * 목록 타입별 조회 (Type 필터 있음) - User Fetch Join
     * Enum 파라미터 바인딩 문제를 피하기 위해 수동으로 넣음
     */
    @Query(value = """
            SELECT * FROM "Gallery" 
            WHERE "TYPE" = :typeStr 
            AND "DELETED_AT" IS NULL
            ORDER BY "CREATED_AT" DESC 
            """,
            countQuery = "SELECT count(*) FROM \"Gallery\" WHERE \"TYPE\" = :typeStr AND \"DELETED_AT\" IS NULL",
            nativeQuery = true)
    Page<Gallery> findByType(@Param("typeStr") String typeStr, Pageable pageable);

    /**
     * 상세 조회
     */
    @Query("SELECT g FROM Gallery g JOIN FETCH g.user LEFT JOIN FETCH g.galleryMedia WHERE g.galleryId = :galleryId")
    Optional<Gallery> findByIdWithUserAndMedia(@Param("galleryId") Long galleryId);
}
