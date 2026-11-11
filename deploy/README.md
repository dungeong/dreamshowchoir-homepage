# 드림쇼콰이어 배포

GitHub Actions가 Linux x86-64용 Next.js와 Spring Boot 이미지를 빌드합니다. `main`에서 두 빌드가 성공하면 `ghcr.io/dungeong/dreamshowchoir-homepage` 아래에 커밋 SHA 태그로 등록합니다. 서버에서는 Compose로 이미지 버전을 지정해 반영합니다.

## 이미지 빌드

GitHub Actions의 저장소 변수에 현재 운영 프런트가 사용하는 `NEXT_PUBLIC_*` 값을 입력합니다. 워크플로는 `NEXT_PUBLIC_API_URL`의 기본값으로 `https://dreamshowchoir.ulsan.kr`을 사용합니다. 브라우저에 공개되는 설정만 저장소 변수에 넣습니다. AWS·OAuth·메일 인증 정보와 Google Calendar 서비스 계정 파일은 서버에서 런타임에 읽습니다.

## 새 서버 준비

1. `compose.yaml`과 `.env.example`을 같은 디렉터리에 둡니다. `.env.example`을 `.env`로 복사하고 접근 권한을 `0600`으로 설정합니다. `IMAGE_TAG`에는 두 이미지가 모두 등록된 커밋 SHA를, `POSTGRES_VERSION`에는 기존 PostgreSQL과 같은 메이저 버전의 이미지 태그를 입력합니다.
2. 현재 운영 백엔드의 설정을 `deploy/config/application-secret.yml`에 두고 운영 Flyway 설정과 프로필을 확인합니다. Google Calendar 인증 파일을 쓰는 경우 같은 디렉터리에 두고 `google.calendar.credentials-path`에 컨테이너의 절대 경로 `/run/dreamshowchoir/google-credentials.json`을 지정합니다. 설정 디렉터리와 파일을 백엔드의 그룹 ID `10001`이 읽을 수 있도록 설정합니다.
3. 먼저 DB만 띄워서 백업 복원을 검증합니다. 원본 DB의 역할, 확장, 데이터와 `flyway_schema_history`를 확인하고, 복원된 DB에서 백엔드를 시작합니다. Compose의 `postgres-data` 볼륨에 PostgreSQL 데이터가 저장됩니다.

```sh
docker compose config --quiet
docker compose up -d --wait db
```

## 앱 배포

비공개 GHCR 이미지에는 해당 패키지를 읽을 수 있는 계정으로 서버에서 로그인합니다. `frontend`와 `backend` 이미지를 둘 다 내려받은 뒤 앱을 시작합니다. 다음 배포에서도 `.env`의 `IMAGE_TAG`를 변경한 후 같은 명령을 실행합니다.

```sh
docker compose pull frontend backend
docker compose up -d --no-deps frontend backend
docker compose ps
```

호스트 Nginx 설정은 `nginx.conf.example`을 참고합니다. 운영 HTTPS 인증서를 구성하고 `server.forward-headers-strategy`의 운영값을 확인합니다. `/api/download`는 Next.js, `/api/`와 OAuth 인증 경로는 Spring Boot로 연결합니다. 도메인을 전환하기 전에 카카오·네이버 로그인, 단원 자료 다운로드, 큰 파일 업로드, S3 및 캘린더 연동을 검증합니다.

운영 전환 시 기존 EC2의 DB 쓰기를 중지하고 최종 백업을 새 서버에 복원한 뒤 DNS를 변경합니다. 새 서버에 쓰기 트래픽을 받은 뒤 이전 서버로 돌아가야 하는 경우에는 그 사이에 쌓인 데이터를 먼저 반영합니다.
