-- V10__Create_SiteContent_Table.sql
-- '단원 모집 안내(RECRUIT_GUIDE)', '후원 방법 안내(DONATION_GUIDE)' 등
-- 관리자가 수정하는 정적 페이지의 내용을 저장할 테이블

CREATE TABLE "SiteContent" (
    "CONTENT_KEY" VARCHAR(50) NOT NULL,
    "TITLE" VARCHAR(255) NOT NULL,
    "CONTENT" TEXT NULL,
    "UPDATED_AT" TIMESTAMPTZ NULL,
    PRIMARY KEY ("CONTENT_KEY")
);

-- 나중에 API로 수정할 수 있도록, 2개의 빈 페이지를 미리 생성
INSERT INTO "SiteContent" ("CONTENT_KEY", "TITLE", "CONTENT", "UPDATED_AT")
VALUES
    ('RECRUIT_GUIDE', '단원 모집 안내', '<p>모집 안내 내용을 여기에 입력하세요.</p>', CURRENT_TIMESTAMP),
    ('DONATION_GUIDE', '후원 방법 안내', '<p>후원 방법 안내 내용을 여기에 입력하세요.</p>', CURRENT_TIMESTAMP);