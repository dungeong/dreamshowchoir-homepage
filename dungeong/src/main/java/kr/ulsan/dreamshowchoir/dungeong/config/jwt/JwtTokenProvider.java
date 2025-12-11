package kr.ulsan.dreamshowchoir.dungeong.config.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import kr.ulsan.dreamshowchoir.dungeong.config.auth.UserPrincipal;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    private final Key key;
    // Access Token 만료 시간 Getter
    @Getter
    private final long tokenValidityInMilliseconds;

    // Refresh Token 만료 시간 Getter
    // application.properties에 설정할 Refresh Token 만료 시간 (예: 14일 = 1209600000 밀리초)
    @Getter
    @Value("${jwt.refresh-token-validity-in-milliseconds}")
    private long refreshTokenValidityInMilliseconds;

    // application-oauth.properties에서 설정값 주입
    public JwtTokenProvider(
            @Value("${jwt.secret-key}") String secretKey,
            @Value("${jwt.token-validity-in-milliseconds}") long tokenValidityInMilliseconds) {

        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes); // HMAC-SHA 키 생성
        this.tokenValidityInMilliseconds = tokenValidityInMilliseconds;
    }

    /**
     * 인증(Authentication) 객체를 기반으로 JWT 토큰을 생성
     */
    public String createToken(Authentication authentication) {
        // 권한(Role) 문자열 가져오기
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        long now = (new Date()).getTime();
        Date validity = new Date(now + this.tokenValidityInMilliseconds); // 만료 시간 설정

        // UserPrincipal에서 사용자 ID (PK) 가져오기
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getUserId();
        String email = userPrincipal.getUsername();

        return Jwts.builder()
                .setSubject(userId.toString()) // 토큰 제목
                .claim("email", email)      // Payload에 email 추가
                .claim("userId", userId)    // Payload에 userId 추가
                .claim("auth", authorities) // Payload에 권한 추가
                .signWith(key, SignatureAlgorithm.HS512) // 비밀 키로 서명
                .setExpiration(validity) // 만료 시간 설정
                .compact();
    }

    /**
     * JWT 토큰을 복호화하여 인증(Authentication) 객체를 생성
     */
    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        Collection<? extends GrantedAuthority> authorities =
                Arrays.stream(claims.get("auth").toString().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

        // Payload에서 userId 가져오기
        Long userId = claims.get("userId", Long.class);

        // UserPrincipal 대신 userId를 principal로 사용 (컨트롤러에서 @AuthenticationPrincipal Long userId로 받기 위함)
        return new UsernamePasswordAuthenticationToken(userId, token, authorities);
    }

    /**
     * JWT 토큰의 유효성을 검증
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.info("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            log.debug("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            log.info("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            log.info("JWT 토큰이 잘못되었습니다.");
        }
        return false;
    }

    // Refresh Token 생성 메소드 (Access Token과 만료 시간만 다름)
    public String createRefreshToken(Authentication authentication) {
        return Jwts.builder()
                .setSubject(authentication.getName())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + this.refreshTokenValidityInMilliseconds))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    // Refresh Token 만료 시간 가져오기 (DB 저장용)
    public LocalDateTime getRefreshTokenExpiryDate(String token) {
        Date expiration = Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getExpiration();
        return expiration.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
    }

}