package kr.ulsan.dreamshowchoir.dungeong.service;

import io.jsonwebtoken.JwtException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import kr.ulsan.dreamshowchoir.dungeong.config.auth.UserPrincipal;
import kr.ulsan.dreamshowchoir.dungeong.config.jwt.JwtTokenProvider;
import kr.ulsan.dreamshowchoir.dungeong.domain.auth.RefreshToken;
import kr.ulsan.dreamshowchoir.dungeong.domain.auth.repository.RefreshTokenRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.MemberProfile;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.Role;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.MemberProfileRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.UserRepository;
import kr.ulsan.dreamshowchoir.dungeong.domain.user.repository.WithdrawalHistoryRepository;
import kr.ulsan.dreamshowchoir.dungeong.dto.auth.JwtTokenDto;
import kr.ulsan.dreamshowchoir.dungeong.dto.user.UserResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor // final 필드에 대한 생성자를 자동으로 만들어줌 (DI)
public class AuthService {

    private final UserRepository userRepository;
    private final MemberProfileRepository memberProfileRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final WithdrawalHistoryRepository withdrawalHistoryRepository;

    /**
     * OAuth2 로그인 시, DB에 사용자가 없으면 회원가입, 있으면 정보를 업데이트한다.
     *
     * @param provider        OAuth 제공자 (e.g., "google", "kakao")
     * @param oauthId         제공자의 식별 ID
     * @param email           이메일
     * @param name            이름
     * @param profileImageKey 프로필 이미지 URL (S3 키)
     * @return 로그인한 사용자의 DTO
     */
    @Transactional
    public User loadOrRegisterUser(String provider, String oauthId, String email, String name, String profileImageKey,
            String phoneNumber, LocalDate birthDate, String gender) {

        // 탈퇴 기록 확인 및 탈퇴 후 6개월 미만 가입 차단
        withdrawalHistoryRepository.findByOauthProviderAndOauthId(provider, oauthId)
                .ifPresent(history -> {
                    throw new IllegalStateException(
                            "탈퇴 후 6개월 내에는 재가입할 수 없습니다. (탈퇴일: " + history.getWithdrawnAt().toLocalDate() + ")");
                });
        // DB에서 OAuth 정보로 사용자를 찾음
        Optional<User> optionalUser = userRepository.findByOauthProviderAndOauthId(provider, oauthId);

        User user;
        if (optionalUser.isPresent()) { // 이미 가입된 사용자인 경우 (로그인)
            user = optionalUser.get();
            // OAuth 프로필 정보가 변경되었을 수 있으니, 이름과 프로필 사진을 업데이트함
            user.updateOAuthInfo(name, profileImageKey);
            // @Transactional 덕분에, save()를 호출하지 않아도 더티 체킹으로 DB에 자동 반영됨
        } else { // 처음 방문한 사용자인 경우 (자동 회원가입)
            user = User.builder()
                    .oauthProvider(provider)
                    .oauthId(oauthId)
                    .email(email)
                    .name(name)
                    .profileImageKey(profileImageKey)
                    .role(Role.GUEST) // 가입 시 기본 권한은 'USER'(일반 사용자)
                    .termsAgreed(false)
                    .phoneNumber(phoneNumber)
                    .birthDate(birthDate)
                    .gender(gender)
                    .build();
            user = userRepository.save(user); // DB에 저장
        }

        return user;
    }

    /**
     * 현재 로그인 된 사용자의 ID로 상세 정보를 조회
     *
     * @param userId 현재 로그인 된 사용자 Id
     * @return 로그인한 사용자의 상세 정보 DTO
     */
    @Transactional(readOnly = true)
    public UserResponseDto getUserInfo(Long userId) {

        // User 조회 (없으면 예외 발생)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 유저를 찾을 수 없습니다. ID : " + userId));

        // MemberProfile 조회 (없으면 null)
        MemberProfile profile = memberProfileRepository.findById(userId).orElse(null);

        // DTO로 변환하여 반환
        return UserResponseDto.builder()
                .user(user)
                .profile(profile)
                .build();
    }

    /**
     * 로그인 성공 시: Access Token 발급 및 Refresh Token 발급/저장/쿠키설정
     */
    @Transactional
    public JwtTokenDto issueTokens(Authentication authentication, HttpServletResponse response) {
        // Access Token 생성
        String accessToken = jwtTokenProvider.createToken(authentication);

        // Refresh Token 생성
        String refreshTokenValue = jwtTokenProvider.createRefreshToken(authentication);
        LocalDateTime expiresAt = jwtTokenProvider.getRefreshTokenExpiryDate(refreshTokenValue);

        User user = userRepository.findById(Long.valueOf(authentication.getName()))
                .orElseThrow(() -> new EntityNotFoundException("유저를 찾을 수 없습니다."));

        // DB에 Refresh Token 저장 (기존 토큰이 있으면 Rotation, 없으면 새로 생성)
        RefreshToken refreshToken = refreshTokenRepository.findByTokenValue(refreshTokenValue)
                .map(token -> {
                    token.updateToken(refreshTokenValue, expiresAt);
                    return token;
                })
                .orElseGet(() -> RefreshToken.builder()
                        .user(user)
                        .tokenValue(refreshTokenValue)
                        .expiresAt(expiresAt)
                        .build());

        refreshTokenRepository.save(refreshToken);

        // Refresh Token을 HttpOnly 쿠키로 설정
        setRefreshTokenCookie(response, refreshTokenValue);

        return JwtTokenDto.builder()
                .grantType("Bearer")
                .accessToken(accessToken)
                .refreshToken("")
                .accessTokenExpiresIn(jwtTokenProvider.getTokenValidityInMilliseconds())
                .build();
    }

    /**
     * Access Token 갱신 (Refresh Token 사용)
     */
    @Transactional
    public JwtTokenDto refreshAccessToken(String refreshTokenValue, HttpServletResponse response) {
        // 토큰 유효성 검증
        if (!jwtTokenProvider.validateToken(refreshTokenValue)) {
            throw new JwtException("유효하지 않은 Refresh Token입니다.");
        }

        // DB에서 토큰 찾기
        RefreshToken refreshToken = refreshTokenRepository.findByTokenValue(refreshTokenValue)
                .orElseThrow(() -> new JwtException("DB에 존재하지 않는 Refresh Token입니다."));

        // 만료 시간 DB 재검증
        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken); // 만료된 토큰 삭제
            throw new JwtException("만료된 Refresh Token입니다.");
        }

        Authentication authentication = getAuthentication(refreshToken);

        // 새 Access Token 발급 (이제 에러 안 남!)
        String newAccessToken = jwtTokenProvider.createToken(authentication);

        // Refresh Token Rotation: 보안 강화를 위해 Refresh Token도 함께 교체
        String newRefreshTokenValue = jwtTokenProvider.createRefreshToken(authentication);
        LocalDateTime newExpiresAt = jwtTokenProvider.getRefreshTokenExpiryDate(newRefreshTokenValue);
        refreshToken.updateToken(newRefreshTokenValue, newExpiresAt);
        // refreshTokenRepository.save(refreshToken); // Dirty Checking으로 자동 저장

        // 새 Refresh Token 쿠키 설정
        setRefreshTokenCookie(response, newRefreshTokenValue);

        // String 토큰을 JwtTokenDto로 변환하여 반환
        return JwtTokenDto.builder()
                .grantType("Bearer")
                .accessToken(newAccessToken)
                .refreshToken("") // 쿠키로 전달되므로 비워둠
                .accessTokenExpiresIn(jwtTokenProvider.getTokenValidityInMilliseconds()) // 만료 시간 추가
                .build();
    }

    private Authentication getAuthentication(RefreshToken refreshToken) {
        // 리프레시 토큰에서 User 엔티티 가져오기
        User user = refreshToken.getUser();

        // 생성자를 통해 UserPrincipal 객체 생성 (create 메서드 대신 new 사용)
        UserPrincipal principal = new UserPrincipal(user);

        // Authentication 객체 생성
        return new UsernamePasswordAuthenticationToken(
                principal,
                "",
                principal.getAuthorities()
        );
    }

    /**
     * 로그아웃 (DB에서 토큰 삭제 및 쿠키 만료)
     */
    @Transactional
    public void logout(String refreshTokenValue, HttpServletResponse response) {
        if (refreshTokenValue != null && jwtTokenProvider.validateToken(refreshTokenValue)) {
            // DB에서 해당 토큰 삭제
            refreshTokenRepository.findByTokenValue(refreshTokenValue)
                    .ifPresent(refreshTokenRepository::delete);
        }
        // 쿠키 만료 처리
        expireRefreshTokenCookie(response);
    }

    // [Helper] Refresh Token 쿠키 설정
    private void setRefreshTokenCookie(HttpServletResponse response, String refreshTokenValue) {
        Cookie cookie = new Cookie("refresh_token", refreshTokenValue);
        cookie.setHttpOnly(true); // 자바스크립트 접근 불가 (필수)
        cookie.setSecure(false); // 로컬 개발용 false, 배포 시 true로 변경 필요!
        cookie.setPath("/"); // 전체 경로에서 유효
        cookie.setMaxAge((int) (jwtTokenProvider.getRefreshTokenValidityInMilliseconds() / 1000)); // 초 단위 만료 시간
        response.addCookie(cookie);
    }

    // [Helper] Refresh Token 쿠키 만료 처리
    private void expireRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refresh_token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0); // 즉시 만료
        response.addCookie(cookie);
    }

    @Scheduled(cron = "0 0 3 * * *") // 매일 새벽 3시
    @Transactional
    public void cleanupWithdrawalHistory() {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        withdrawalHistoryRepository.deleteByWithdrawnAtBefore(sixMonthsAgo);
    }
}