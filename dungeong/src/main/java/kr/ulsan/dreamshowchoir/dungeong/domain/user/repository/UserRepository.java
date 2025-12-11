package kr.ulsan.dreamshowchoir.dungeong.domain.user.repository;

import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
        // 이메일로 조회 (논리 삭제된 유저 제외)
        Optional<User> findByEmail(String email);

        // OAuth 정보로 조회 (논리 삭제된 유저 제외)
        Optional<User> findByOauthProviderAndOauthId(String oauthProvider, String oauthId);

        /**
         * 공개된 단원 목록 조회
         * - 조건 1: 권한이 MEMBER (단원)
         * - 조건 2: 프로필 공개 여부가 TRUE
         * - 성능: JOIN FETCH를 사용하여 N+1 문제 방지 (User 조회 시 Profile도 한방에 가져옴)
         */
        @Query("SELECT u FROM User u JOIN FETCH u.memberProfile mp " +
                        "WHERE u.role = 'MEMBER' AND mp.isPublic = TRUE " +
                        "AND (:part IS NULL OR mp.part = :part)")
        Page<User> findPublicMembers(@Param("part") String part, Pageable pageable);

        /**
         * [관리자용] 전체 회원 목록 조회 (페이징 + 검색 + 필터링)
         * - role이 null이면 전체 조회
         * - name이 null이면 전체 조회 (검색어 포함 LIKE 검색)
         * - MemberProfile은 없어도 조회되어야 하므로 LEFT JOIN FETCH
         */
        @Query("SELECT u FROM User u LEFT JOIN FETCH u.memberProfile mp " +
                        "WHERE (:role IS NULL OR u.role = :role) " +
                        "AND (:name IS NULL OR u.name LIKE %:name%)")
        Page<User> findAllForAdmin(@Param("role") Role role, @Param("name") String name, Pageable pageable);

        // 특정 권한이 아닌 유저 수 (예: GUEST 제외)
        long countByRoleNot(Role role);

        // 기간 내 가입한 유저 수
        long countByCreatedAtBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
}