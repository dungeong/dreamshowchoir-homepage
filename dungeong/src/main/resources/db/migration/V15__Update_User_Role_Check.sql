-- V15__Update_User_Role_Check.sql
-- User 테이블의 ROLE 컬럼 제약 조건에 'GUEST' 추가

-- 1. 기존 제약 조건 삭제
ALTER TABLE "User" DROP CONSTRAINT "User_ROLE_check";

-- 2. 새로운 제약 조건 추가 (GUEST 포함)
ALTER TABLE "User" ADD CONSTRAINT "User_ROLE_check"
    CHECK ("ROLE" IN ('GUEST', 'USER', 'MEMBER', 'ADMIN'));