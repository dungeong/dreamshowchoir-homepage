-- V13__Add_UpdatedAt_To_Comment.sql
-- 댓글 수정 여부를 시간으로 판별하기 위해 수정일시 컬럼 추가

ALTER TABLE "Comment"
    ADD COLUMN "UPDATED_AT" TIMESTAMPTZ NULL;