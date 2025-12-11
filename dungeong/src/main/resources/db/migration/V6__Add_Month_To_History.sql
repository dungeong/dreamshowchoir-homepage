-- V6__Add_Month_To_History.sql

ALTER TABLE "History" ADD COLUMN "MONTH" INTEGER NULL; -- '월' 컬럼 추가 (null 허용)

-- '연도'와 '월'을 함께 정렬하기 위한 새 인덱스 생성
CREATE INDEX "IDX_HISTORY_YEAR_MONTH" ON "History" ("YEAR" ASC, "MONTH" ASC);