package kr.ulsan.dreamshowchoir.dungeong.dto.common;

import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 페이징 처리 응답을 위한 범용 DTO
 *
 * @param <T> 목록에 포함될 DTO의 타입
 */
@Getter
public class PageResponseDto<T> {

    private final List<T> content;    // 현재 페이지의 데이터 리스트
    private final int pageNumber;     // 현재 페이지 번호 (0부터 시작)
    private final int pageSize;       // 페이지 당 데이터 개수
    private final int totalPages;     // 전체 페이지 수
    private final long totalElements; // 전체 데이터 개수
    private final boolean isLast;     // 마지막 페이지인지 여부

    /**
     * Spring Data의 Page 객체를 받아 PageResponseDto로 변환
     *
     * @param page Spring Data의 Page 객체
     */
    public PageResponseDto(Page<T> page) {
        this.content = page.getContent();
        this.pageNumber = page.getNumber();
        this.pageSize = page.getSize();
        this.totalPages = page.getTotalPages();
        this.totalElements = page.getTotalElements();
        this.isLast = page.isLast();
    }
}