-- JoinApplication 테이블에 프로필 이미지 키 컬럼 추가
ALTER TABLE "JoinApplication"
    ADD COLUMN "PROFILE_IMAGE" VARCHAR(255) NULL;