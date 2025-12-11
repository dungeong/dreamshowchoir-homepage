package kr.ulsan.dreamshowchoir.dungeong.config.auth;

import kr.ulsan.dreamshowchoir.dungeong.domain.user.User;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

@Slf4j
@Getter
public class UserPrincipal implements UserDetails, OAuth2User {

    private final Long userId;
    private final String email;
    private final Collection<? extends GrantedAuthority> authorities;
    private Map<String, Object> attributes; // OAuth2 제공자로부터 받은 원본 데이터

    // 일반 로그인 생성자 (지금은 안 쓰지만 UserDetails를 위해)
    public UserPrincipal(User user) {
        this.userId = user.getUserId();
        this.email = user.getEmail();
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(user.getRole().getKey()));
    }

    // OAuth2 로그인 생성자
    public UserPrincipal(User user, Map<String, Object> attributes) {
        this.userId = user.getUserId();
        this.email = user.getEmail();
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(user.getRole().getKey()));
        this.attributes = attributes;
    }

    // ================================================================
    // UserDetails 인터페이스 구현 (일반 로그인용)
    // ================================================================

    @Override
    public String getUsername() { return String.valueOf(userId); }

    @Override
    public String getPassword() { return null; }

    // (계정 만료/잠금 등은 지금은 사용하지 않으므로 모두 true)
    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    // ---------------- OAuth2User 구현
    @Override
    public Map<String, Object> getAttributes() { return attributes; }

    @Override
    public String getName() {
        return String.valueOf(userId);
    }
}