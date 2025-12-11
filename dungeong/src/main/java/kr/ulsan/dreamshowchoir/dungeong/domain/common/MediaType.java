package kr.ulsan.dreamshowchoir.dungeong.domain.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MediaType {

    // 갤러리용
    IMAGE("IMAGE", "이미지"),
    VIDEO("VIDEO", "영상"),

    // 자료실용
    AUDIO("AUDIO", "오디오/음악"),
    PDF("PDF", "PDF 문서"),
    HWP("HWP", "한글(HWP) 문서"),
    ZIP("ZIP", "압축 파일"),

    // 기타 문서
    DOCUMENT("DOCUMENT", "기타 문서(DOC, PPT 등)"),
    ETC("ETC", "기타 파일");

    private final String key;
    private final String title;

    public static MediaType fromExtension(String extension) {
        if (extension == null || extension.isEmpty()) {
            return ETC;
        }

        String ext = extension.toLowerCase();

        if (ext.equals("jpg") || ext.equals("jpeg") || ext.equals("png") || ext.equals("gif")) {
            return IMAGE;
        }
        if (ext.equals("mp4") || ext.equals("avi") || ext.equals("mov")) {
            return VIDEO;
        }
        if (ext.equals("mp3") || ext.equals("wav") || ext.equals("m4a")) {
            return AUDIO;
        }
        if (ext.equals("pdf")) {
            return PDF;
        }
        if (ext.equals("hwp") || ext.equals("hwpx")) {
            return HWP;
        }
        if (ext.equals("zip") || ext.equals("rar") || ext.equals("7z")) {
            return ZIP;
        }
        if (ext.equals("doc") || ext.equals("docx") || ext.equals("ppt") || ext.equals("pptx") || ext.equals("xls") || ext.equals("xlsx")) {
            return DOCUMENT;
        }

        return ETC;
    }

}
