-- 1. 테이블 이름 변경 (withdrawal_history -> "WithdrawalHistory")
ALTER TABLE withdrawal_history RENAME TO "WithdrawalHistory";

-- 2. 컬럼 이름 변경 (소문자 -> 대문자)
ALTER TABLE "WithdrawalHistory" RENAME COLUMN history_id TO "HISTORY_ID";
ALTER TABLE "WithdrawalHistory" RENAME COLUMN oauth_provider TO "OAUTH_PROVIDER";
ALTER TABLE "WithdrawalHistory" RENAME COLUMN oauth_id TO "OAUTH_ID";
ALTER TABLE "WithdrawalHistory" RENAME COLUMN email TO "EMAIL";
ALTER TABLE "WithdrawalHistory" RENAME COLUMN withdrawn_at TO "WITHDRAWN_AT";

-- 3. 제약조건 이름 변경 (선택사항이지만 깔끔하게 맞추기 위해)
-- (기존 V17에서 생성된 제약조건 이름이 uq_withdrawal_history_oauth 라고 가정)
ALTER TABLE "WithdrawalHistory" RENAME CONSTRAINT uq_withdrawal_history_oauth TO "UQ_WithdrawalHistory_OAuth";