-- V7__Make_History_Month_Not_Null.sql

-- "MONTH" 컬럼을 NOT NULL로 변경
ALTER TABLE "History" ALTER COLUMN "MONTH" SET NOT NULL;

-- "MONTH" 컬럼의 기본값(DEFAULT)을 1로 설정
ALTER TABLE "History" ALTER COLUMN "MONTH" SET DEFAULT 1;