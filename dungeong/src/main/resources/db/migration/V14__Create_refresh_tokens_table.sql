-- V14: Refresh Tokens 테이블 생성

CREATE TABLE "RefreshTokens" (
                                 "TOKEN_ID" BIGSERIAL PRIMARY KEY, -- 자동 증가하는 기본키 (Long 타입 대응)

    -- User 테이블의 USER_ID를 참조하는 외래키 (Long 타입 대응)
                                 "USER_ID" BIGINT NOT NULL,

    -- 리프레시 토큰 값 (해시값이 아닌 실제 토큰 값을 저장하는 경우 길이가 깁니다. TEXT 사용)
    -- 보안을 위해 해시값을 저장하는 경우 VARCHAR(length)를 사용할 수 있습니다.
                                 "TOKEN_VALUE" TEXT NOT NULL,

    -- 토큰 만료 일시 (LocalDateTime 타입 대응)
                                 "EXPIRES_AT" TIMESTAMP NOT NULL,

    -- 토큰 생성 일시 (LocalDateTime 타입 대응)
                                 "CREATED_AT" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 외래키 제약 조건 설정 (User 테이블의 USER_ID 참조, 유저 삭제 시 토큰도 함께 삭제)
                                 CONSTRAINT "FK_RefreshTokens_User" FOREIGN KEY ("USER_ID")
                                     REFERENCES "User" ("USER_ID") ON DELETE CASCADE
);

-- 성능 향상을 위해 TOKEN_VALUE에 인덱스 생성 (토큰 조회 시 사용)
CREATE INDEX "IDX_RefreshTokens_TokenValue" ON "RefreshTokens" ("TOKEN_VALUE");

-- 한 유저가 여러 기기에서 로그인할 수 있으므로 USER_ID에 대한 유니크 인덱스는 걸지 않습니다.
-- 대신 특정 유저의 모든 토큰을 조회할 때를 대비해 인덱스를 생성합니다.
CREATE INDEX "IDX_RefreshTokens_UserId" ON "RefreshTokens" ("USER_ID");