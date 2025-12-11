-- V1에서 생성된 제약조건(FK_User_TO_...)과 V17/19에서 시도했던 제약조건들을 모두 정리하고
-- 최종 정책(개인정보 삭제 vs 단체자산 보존)을 적용합니다.

-- =========================================================
-- [그룹 1] 개인정보 & 인증 데이터 -> CASCADE (회원 삭제 시 즉시 삭제)
-- =========================================================

-- 1. 가입 신청서 (JoinApplication)
ALTER TABLE "JoinApplication" DROP CONSTRAINT IF EXISTS "FK_User_TO_JoinApplication"; -- V1 이름
ALTER TABLE "JoinApplication" DROP CONSTRAINT IF EXISTS "FK_JoinApplication_User_Cascade"; -- V19 이름
ALTER TABLE "JoinApplication"
    ADD CONSTRAINT "FK_JoinApplication_User_Cascade"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE CASCADE;

-- 2. 단원 프로필 (MemberProfile)
ALTER TABLE "MemberProfile" DROP CONSTRAINT IF EXISTS "FK_User_TO_MemberProfile";
ALTER TABLE "MemberProfile" DROP CONSTRAINT IF EXISTS "FK_MemberProfile_User_Cascade";
ALTER TABLE "MemberProfile"
    ADD CONSTRAINT "FK_MemberProfile_User_Cascade"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE CASCADE;

-- 3. 게시글 (Post)
ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "FK_User_TO_Post";
ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "FK_Post_User_Cascade";
ALTER TABLE "Post"
    ADD CONSTRAINT "FK_Post_User_Cascade"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE CASCADE;

-- 4. 댓글 (Comment)
ALTER TABLE "Comment" DROP CONSTRAINT IF EXISTS "FK_User_TO_Comment";
ALTER TABLE "Comment" DROP CONSTRAINT IF EXISTS "FK_Comment_User_Cascade";
ALTER TABLE "Comment"
    ADD CONSTRAINT "FK_Comment_User_Cascade"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE CASCADE;

-- 5. 알림 (Notification)
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "FK_User_TO_Notification";
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "FK_Notification_User_Cascade";
ALTER TABLE "Notification"
    ADD CONSTRAINT "FK_Notification_User_Cascade"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE CASCADE;

-- 6. 리프레시 토큰 (RefreshTokens)
ALTER TABLE "RefreshTokens" DROP CONSTRAINT IF EXISTS "FK_RefreshToken_User";
ALTER TABLE "RefreshTokens" DROP CONSTRAINT IF EXISTS "FK_RefreshTokens_User_Cascade";
ALTER TABLE "RefreshTokens"
    ADD CONSTRAINT "FK_RefreshTokens_User_Cascade"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE CASCADE;


-- =========================================================
-- [그룹 2] 단체 자산 & 법적 기록 -> SET NULL (데이터 보존, 작성자 알수없음 처리)
-- ※ 주의: SET NULL을 하려면 USER_ID 컬럼이 NULL 값을 허용해야 합니다.
-- =========================================================

-- 1. 후원 (Donation) - 법적 의무 보관
ALTER TABLE "Donation" ALTER COLUMN "USER_ID" DROP NOT NULL;
ALTER TABLE "Donation" DROP CONSTRAINT IF EXISTS "FK_User_TO_Donation";
ALTER TABLE "Donation" DROP CONSTRAINT IF EXISTS "FK_Donation_User_SetNull";
ALTER TABLE "Donation"
    ADD CONSTRAINT "FK_Donation_User_SetNull"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE SET NULL;

-- 2. 공지사항 (Notice) - 단체 자산
ALTER TABLE "Notice" ALTER COLUMN "USER_ID" DROP NOT NULL;
ALTER TABLE "Notice" DROP CONSTRAINT IF EXISTS "FK_User_TO_Notice";
ALTER TABLE "Notice" DROP CONSTRAINT IF EXISTS "FK_Notice_User_SetNull";
ALTER TABLE "Notice"
    ADD CONSTRAINT "FK_Notice_User_SetNull"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE SET NULL;

-- 3. 갤러리 (Gallery) - 단체 자산
ALTER TABLE "Gallery" ALTER COLUMN "USER_ID" DROP NOT NULL;
ALTER TABLE "Gallery" DROP CONSTRAINT IF EXISTS "FK_User_TO_Gallery";
ALTER TABLE "Gallery" DROP CONSTRAINT IF EXISTS "FK_Gallery_User_SetNull";
ALTER TABLE "Gallery"
    ADD CONSTRAINT "FK_Gallery_User_SetNull"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE SET NULL;

-- 4. 악보/자료 (Sheet) - 단체 자산
ALTER TABLE "Sheet" ALTER COLUMN "USER_ID" DROP NOT NULL;
ALTER TABLE "Sheet" DROP CONSTRAINT IF EXISTS "FK_User_TO_Sheet";
ALTER TABLE "Sheet" DROP CONSTRAINT IF EXISTS "FK_Sheet_User_SetNull";
ALTER TABLE "Sheet"
    ADD CONSTRAINT "FK_Sheet_User_SetNull"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE SET NULL;

-- 5. 활동 자료 (ActivityMaterial) - 단체 자산
ALTER TABLE "ActivityMaterial" ALTER COLUMN "USER_ID" DROP NOT NULL;
ALTER TABLE "ActivityMaterial" DROP CONSTRAINT IF EXISTS "FK_User_TO_ActivityMaterial";
ALTER TABLE "ActivityMaterial" DROP CONSTRAINT IF EXISTS "FK_ActivityMaterial_User_SetNull";
ALTER TABLE "ActivityMaterial"
    ADD CONSTRAINT "FK_ActivityMaterial_User_SetNull"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE SET NULL;