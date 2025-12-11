-- 1. [가입 신청서] 에러를 일으킨 범인(FK_User_TO_JoinApplication) 제거 후 CASCADE 재설정
ALTER TABLE "JoinApplication" DROP CONSTRAINT IF EXISTS "FK_User_TO_JoinApplication";
ALTER TABLE "JoinApplication" DROP CONSTRAINT IF EXISTS "FK_JoinApplication_User_Cascade"; -- 혹시 중복될까봐 제거
ALTER TABLE "JoinApplication"
    ADD CONSTRAINT "FK_JoinApplication_User_Cascade"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE CASCADE;

-- 2. [알림] 혹시 모를 다른 테이블들도 이름 패턴(FK_User_TO_...)에 맞춰 정리
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "FK_User_TO_Notification";
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "FK_Notification_User_Cascade";
ALTER TABLE "Notification"
    ADD CONSTRAINT "FK_Notification_User_Cascade"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE CASCADE;

-- 3. [단원 프로필]
ALTER TABLE "MemberProfile" DROP CONSTRAINT IF EXISTS "FK_User_TO_MemberProfile";
ALTER TABLE "MemberProfile" DROP CONSTRAINT IF EXISTS "FK_MemberProfile_User_Cascade";
ALTER TABLE "MemberProfile"
    ADD CONSTRAINT "FK_MemberProfile_User_Cascade"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE CASCADE;

-- 4. [리프레시 토큰]
ALTER TABLE "RefreshTokens" DROP CONSTRAINT IF EXISTS "FK_User_TO_RefreshTokens";
ALTER TABLE "RefreshTokens" DROP CONSTRAINT IF EXISTS "FK_RefreshTokens_User_Cascade";
ALTER TABLE "RefreshTokens"
    ADD CONSTRAINT "FK_RefreshTokens_User_Cascade"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE CASCADE;

-- 5. [게시글]
ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "FK_User_TO_Post";
ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "FK_Post_User_Cascade";
ALTER TABLE "Post"
    ADD CONSTRAINT "FK_Post_User_Cascade"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE CASCADE;

-- 6. [댓글]
ALTER TABLE "Comment" DROP CONSTRAINT IF EXISTS "FK_User_TO_Comment";
ALTER TABLE "Comment" DROP CONSTRAINT IF EXISTS "FK_Comment_User_Cascade";
ALTER TABLE "Comment"
    ADD CONSTRAINT "FK_Comment_User_Cascade"
        FOREIGN KEY ("USER_ID") REFERENCES "User" ("USER_ID")
            ON DELETE CASCADE;