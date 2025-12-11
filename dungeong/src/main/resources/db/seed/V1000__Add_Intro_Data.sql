-- V1000__Add_Intro_Data.sql
-- 사이트 소개(인사말, 조직도) 및 연혁 추가 데이터

-- 1. 인사말 (SiteContent 테이블)
-- Key: GREETING
INSERT INTO "SiteContent" ("CONTENT_KEY", "TITLE", "CONTENT", "UPDATED_AT")
VALUES
    (
        'GREETING',
        '드림쇼콰이어에 오신 것을 환영합니다.',
        E'안녕하세요, 드림쇼콰이어 단장입니다.\n\n저희는 노래를 사랑하고, 꿈을 향해 나아가는 사람들이 모여 만든 합창단입니다.\n음악을 통해 서로의 마음에 공명하고, 그 울림을 세상에 전하는 것을 목표로 하고 있습니다.\n\n화려한 기교보다는 진심이 담긴 목소리로, 듣는 이들에게 따뜻한 위로와 희망을 전하고 싶습니다.\n이곳 홈페이지를 통해 저희의 활동을 지켜봐 주시고, 많은 응원 부탁드립니다.\n\n감사합니다.',
        NOW()
    );

-- 2. 조직도 (SiteContent 테이블)
-- Key: ORGANIZATION
-- 내용은 이미지 URL로 저장
INSERT INTO "SiteContent" ("CONTENT_KEY", "TITLE", "CONTENT", "UPDATED_AT")
VALUES
    (
        'ORGANIZATION',
        '드림쇼콰이어 조직도',
        'https://dummyimage.com/1200x800/f0f0f0/333333.png&text=DreamShow+Choir+Organization+Chart',
        NOW()
    );

-- 3. 연혁 (History 테이블) - 추가 데이터
-- (참고: History 테이블에는 USER_ID나 TITLE 컬럼이 없고 YEAR, MONTH, CONTENT만 있음)
INSERT INTO "History" ("YEAR", "MONTH", "CONTENT", "CREATED_AT")
VALUES
    (2021, 12, '제1회 창단 기념 작은 음악회 개최', NOW()),
    (2022, 8, '사회적협동조합 법인 설립 인가', NOW()),
    (2022, 11, '지역 사회 복지관 찾아가는 음악회 봉사', NOW()),
    (2023, 5, '울산시민 합창 페스티벌 우수상 수상', NOW()),
    (2023, 10, '제2회 정기공연 "꿈의 대화" (문화예술회관)', NOW()),
    (2024, 3, '신입단원 4기 모집 (총 단원 50명 돌파)', NOW());