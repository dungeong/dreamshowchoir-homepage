package kr.ulsan.dreamshowchoir.dungeong.domain.common;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class) // 1. Auditing 기능 활성화
public abstract class BaseTimeEntity {

    @CreatedDate // 2. 생성 시간 자동 저장
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate // 3. 수정 시간 자동 저장
    @Column(name = "UPDATED_AT", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "DELETED_AT")
    private LocalDateTime deletedAt;

    // 논리 삭제 수행
    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }
}
