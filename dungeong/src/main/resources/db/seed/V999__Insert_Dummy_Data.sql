-- V999__Insert_Dummy_Data.sql
-- 개발 및 테스트를 위한 초기 더미 데이터 생성 (페이징 테스트용 대량 데이터 포함)

-- 1. [기본] 사용자 (User) 4명 생성 (테스트용 고정 계정)
INSERT INTO "User" ("EMAIL", "NAME", "OAUTH_PROVIDER", "OAUTH_ID", "ROLE", "PROFILE_IMAGE_KEY", "PHONE_NUMBER", "BIRTH_DATE", "GENDER", "TERMS_AGREED", "CREATED_AT", "UPDATED_AT")
VALUES
    ('admin@dream.com', '관리자', 'naver', 'admin_oauth_id', 'ADMIN', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', '010-1111-1111', '1990-01-01', 'MALE', true, NOW(), NOW()),
    ('soprano@dream.com', '김소프', 'kakao', 'soprano_oauth_id', 'MEMBER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Soprano', '010-2222-2222', '1992-05-05', 'FEMALE', true, NOW(), NOW()),
    ('tenor@dream.com', '이테너', 'naver', 'tenor_oauth_id', 'MEMBER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tenor', '010-3333-3333', '1988-08-15', 'MALE', true, NOW(), NOW()),
    ('newbie@dream.com', '박신입', 'kakao', 'newbie_oauth_id', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Newbie', '010-4444-4444', '2000-12-25', 'FEMALE', true, NOW(), NOW());

-- 2. [추가] 사용자 (User) 15명 대량 생성 (단원 목록 페이징 테스트용)
INSERT INTO "User" ("EMAIL", "NAME", "OAUTH_PROVIDER", "OAUTH_ID", "ROLE", "PROFILE_IMAGE_KEY", "PHONE_NUMBER", "TERMS_AGREED", "CREATED_AT", "UPDATED_AT")
SELECT
    'member_' || i || '@dream.com',
    '단원_' || i,
    'kakao',
    'oauth_dummy_' || i,
    'MEMBER', -- 정단원 권한 부여
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Member' || i,
    '010-0000-' || LPAD(i::text, 4, '0'),
    true,
    NOW(),
    NOW()
FROM generate_series(1, 15) AS i;


-- 3. [기본] 단원 프로필 (MemberProfile) - 고정 계정용 2개
INSERT INTO "MemberProfile" ("USER_ID", "PART", "INTERESTS", "MY_DREAM", "HASH_TAGS", "IS_PUBLIC", "UPDATED_AT")
VALUES
    ((SELECT "USER_ID" FROM "User" WHERE "EMAIL" = 'soprano@dream.com'), 'SOPRANO', '뮤지컬, 맛집', '예술의 전당 솔로', '#고음폭발 #분위기메이커', true, NOW()),
    ((SELECT "USER_ID" FROM "User" WHERE "EMAIL" = 'tenor@dream.com'), 'TENOR', '축구, 등산', '평생 노래하기', '#든든한테너 #목소리미남', true, NOW());

-- 4. [추가] 단원 프로필 (MemberProfile) - 대량 생성된 15명 연결
-- User 테이블에서 이메일이 'member_%'인 사람들을 찾아서 프로필 생성
INSERT INTO "MemberProfile" ("USER_ID", "PART", "INTERESTS", "MY_DREAM", "HASH_TAGS", "IS_PUBLIC", "UPDATED_AT")
SELECT
    "USER_ID",
    CASE WHEN "USER_ID" % 4 = 0 THEN 'SOPRANO'
         WHEN "USER_ID" % 4 = 1 THEN 'ALTO'
         WHEN "USER_ID" % 4 = 2 THEN 'TENOR'
         ELSE 'BASS' END, -- 파트 골고루 배분
    '합창, 여행, 독서',
    '아름다운 하모니를 만드는 것',
    '#열정단원 #행복한합창',
    true, -- 공개 설정 (목록에 나와야 함)
    NOW()
FROM "User"
WHERE "EMAIL" LIKE 'member_%@dream.com';


-- 5. 배너 (Banner) - 3개 생성
INSERT INTO "Banner" ("TITLE", "DESCRIPTION", "IMAGE_KEY", "IMAGE_NAME", "IS_ACTIVE", "ORDER_INDEX", "CREATED_AT")
VALUES
    ('2025 정기공연', '12월 25일 대공연장', 'https://picsum.photos/1600/600?random=1', 'banner1.jpg', true, 0, NOW()),
    ('신입 단원 모집', '매주 목요일 저녁 7시', 'https://picsum.photos/1600/600?random=2', 'banner2.jpg', true, 1, NOW()),
    ('지난 공연 다시보기', '유튜브 채널에서 확인하세요', 'https://picsum.photos/1600/600?random=3', 'banner3.jpg', true, 2, NOW());


-- [페이징 테스트용 대량 데이터 생성]

-- 6. 공지사항 (Notice) - 15개 생성
INSERT INTO "Notice" ("USER_ID", "TITLE", "CONTENT", "CREATED_AT", "UPDATED_AT")
SELECT
    (SELECT "USER_ID" FROM "User" WHERE "ROLE" = 'ADMIN' LIMIT 1),
    '공지사항 테스트 게시글 ' || i,
    '페이징 테스트를 위한 공지사항 본문입니다. 번호: ' || i,
    NOW() - (i || ' hours')::INTERVAL,
    NOW()
FROM generate_series(1, 15) AS i;

-- 7. 게시판 (Post) - 15개 생성
INSERT INTO "Post" ("USER_ID", "TITLE", "CONTENT", "CREATED_AT", "UPDATED_AT")
SELECT
    (SELECT "USER_ID" FROM "User" WHERE "EMAIL" = 'soprano@dream.com'),
    '자유게시판 수다글 ' || i,
    '안녕하세요. 자유게시판 테스트 중입니다. ' || i,
    NOW() - (i || ' days')::INTERVAL,
    NOW()
FROM generate_series(1, 15) AS i;

-- 8. 갤러리 (Gallery) - 15개 생성
-- 8-1. 갤러리 게시글
INSERT INTO "Gallery" ("USER_ID", "TITLE", "DESCRIPTION", "TYPE", "CREATED_AT")
SELECT
    (SELECT "USER_ID" FROM "User" WHERE "ROLE" = 'ADMIN' LIMIT 1),
    '2024년 정기공연 사진 모음 ' || i,
    '공연 사진입니다. 즐감하세요! 번호: ' || i,
    CASE WHEN i % 2 = 0 THEN 'REGULAR' ELSE 'EVENT' END,
    NOW() - (i || ' days')::INTERVAL
FROM generate_series(1, 15) AS i;

-- 8-2. 갤러리 미디어 (썸네일용 1개씩)
INSERT INTO "GalleryMedia" ("GALLERY_ID", "MEDIA_TYPE", "FILE_KEY", "FILE_NAME", "FILE_SIZE", "CREATED_AT")
SELECT
    g."GALLERY_ID",
    'IMAGE',
    'https://picsum.photos/800/600?random=' || g."GALLERY_ID",
    'photo_' || g."GALLERY_ID" || '.jpg',
    1024 * g."GALLERY_ID",
    NOW()
FROM "Gallery" g;

-- 9. 악보 (Sheet) - 15개 생성
INSERT INTO "Sheet" ("USER_ID", "FILE_KEY", "FILE_NAME", "FILE_SIZE", "CREATED_AT")
SELECT
    (SELECT "USER_ID" FROM "User" WHERE "EMAIL" = 'tenor@dream.com'),
    -- [수정] 뒤에 쿼리스트링(?v=1)을 붙여서 URL을 다르게 만듦
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf?v=' || i,
    '연습곡_악보_' || i || '.pdf',
    1024 * i,
    NOW() - (i || ' minutes')::INTERVAL
FROM generate_series(1, 15) AS i;

-- 10. 활동자료 (ActivityMaterial) - 15개 생성
INSERT INTO "ActivityMaterial" ("USER_ID", "TITLE", "DESCRIPTION", "FILE_KEY", "FILE_NAME", "FILE_SIZE", "CREATED_AT")
SELECT
    (SELECT "USER_ID" FROM "User" WHERE "ROLE" = 'ADMIN' LIMIT 1),
    '드림쇼콰이어 소식지 제 ' || i || '호',
    '이번 달 활동 소식입니다. 번호: ' || i,
    -- [수정] 여기도 ?v=i 붙여서 중복 방지
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf?v=' || i,
    'newsletter_' || i || '.pdf',
    2048 * i,
    NOW() - (i || ' months')::INTERVAL
FROM generate_series(1, 15) AS i;

-- 11. 후원 (Donation) - 명예의 전당용 15개
INSERT INTO "Donation" ("USER_ID", "AMOUNT", "TYPE", "STATUS", "CREATED_AT")
SELECT
    (SELECT "USER_ID" FROM "User" WHERE "EMAIL" = 'soprano@dream.com'),
    10000 * i,
    'ONE_TIME', -- [수정] ONCE -> ONE_TIME (DB 제약조건 준수)
    'COMPLETED',
    NOW() - (i || ' days')::INTERVAL
FROM generate_series(1, 15) AS i;

-- 12. 가입 신청 (JoinApplication) - 1개
INSERT INTO "JoinApplication" ("USER_ID", "PART", "INTERESTS", "MY_DREAM", "HASH_TAGS", "STATUS", "CREATED_AT")
VALUES
    ((SELECT "USER_ID" FROM "User" WHERE "EMAIL" = 'newbie@dream.com'), 'ALTO', '피아노', '무대 공포증 극복', '#열정 #신입', 'PENDING', NOW());