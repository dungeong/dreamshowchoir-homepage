package kr.ulsan.dreamshowchoir.dungeong.dto.content;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SiteContentUpdateRequestDto {

    private String content; // 내용은 비어있을 수 있음
}