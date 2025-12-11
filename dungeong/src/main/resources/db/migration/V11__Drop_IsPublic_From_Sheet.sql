-- V11__Drop_IsPublic_From_Sheet.sql
-- 악보/자료실(Sheet)이 정단원 전용으로 변경됨에 따라 공개 여부(IS_PUBLIC) 컬럼 삭제

ALTER TABLE "Sheet" DROP COLUMN "IS_PUBLIC";