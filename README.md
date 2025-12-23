
# 드림쇼콰이어 공식 홈페이지 (Dream Show Choir)

>사회적협동조합 드림쇼콰이어의 공식 정보 제공, 단원 관리 및 커뮤니티 활성화를 위한 웹 플랫폼입니다.

## 배포 링크
**홈페이지 바로가기 :** [https://dreamshowchoir.ulsan.kr](https://dreamshowchoir.ulsan.kr)

---

## Tech Stack & Decision
프로젝트의 목적과 유지보수성을 고려하여 안정적이고 확장 가능한 기술 스택을 선정했습니다.

### Frontend
| 구분 | 기술(Stack) | 선정 이유 (Reasoning) |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14** (App Router) | 합창단 홈페이지 특성상 검색 엔진 노출(SEO)이 중요하여 SSR을 지원하는 Next.js를 선택 |
| **Library** | **React 19.2.1** | 최신 동시성 기능 활용 및 보안 패치가 적용된 버전 사용 |
| **Language** | **TypeScript** | 정적 타입 지정을 통해 런타임 에러를 방지하고 유지보수성을 높이기 위함 |
| **Styling** | **Tailwind CSS** | 별도의 CSS 파일 관리 없이 클래스명만으로 빠르게 반응형 UI를 구현하기 위함 |
| **Editor** | **React-Quill-New** | React 19 호환성 문제를 해결하고, 안정적인 Rich Text 편집 환경을 제공하기 위해 도입 |

### Backend
| 구분 | 기술(Stack) | 선정 이유 (Reasoning) |
| :--- | :--- | :--- |
| **Framework** | **Spring Boot 3.2.3** | 방대한 커뮤니티와 생태계를 갖춘 자바 진영 표준 프레임워크로, 안정적인 API 서버 구축 |
| **Database** | **PostgreSQL** | 복잡한 관계형 데이터 처리에 능하며, JSON 타입 지원 등 확장성이 뛰어난 오픈소스 DB |
| **Security** | **Spring Security + JWT** | 세션 유지 부담이 없는 Stateless한 인증 방식으로 서버 확장성을 고려함 |
| **ORM** | **Spring Data JPA** | 반복적인 SQL 작성을 줄이고 객체 지향적인 데이터 조작을 위해 사용 |
| **Migration** | **Flyway** | 협업 및 배포 시 DB 스키마 변경 이력을 코드로 관리하여 정합성을 유지함 |

### Infrastructure
| 구분 | 기술(Stack) | 선정 이유 (Reasoning) |
| :--- | :--- | :--- |
| **Cloud** | **AWS (EC2, RDS)** | 유연한 서버 리소스 관리와 관리형 데이터베이스의 안정성을 확보 |
| **Server** | **Nginx** | Reverse Proxy를 통해 정적 파일을 처리하고, SSL 적용 및 대용량 파일 업로드 설정을 관리 |

---

## Key Technical Decisions
개발 과정에서 마주친 문제들과 이를 해결하기 위한 기술적 의사결정입니다.

### 1. React 19 호환성 문제와 에디터 교체
- **문제**: 기존 `react-quill` 라이브러리가 더 이상 유지보수되지 않아 React 19 환경에서 `peer dependency` 충돌 및 렌더링 오류 발생.
- **해결**: React 최신 버전을 지원하는 포크 버전인 **`react-quill-new`**로 마이그레이션하고, Next.js의 `dynamic import(ssr: false)`를 적용하여 `document is not defined` 에러를 해결함.

### 2. 대용량 미디어 업로드 처리 (Nginx + Spring Boot)
- **문제**: 고화질 공연 영상 및 배너 업로드 시, 기본 설정 용량(1MB) 제한으로 인해 `413 Payload Too Large` 에러 발생.
- **해결**: Nginx의 `client_max_body_size`와 Spring Boot의 `multipart.max-file-size` 설정을 모두 **300MB**로 증설하고, 타임아웃 시간을 조정하여 대용량 파일도 안정적으로 업로드되도록 개선함.

### 3. DB 스키마 형상 관리 (Flyway)
- **문제**: 로컬 개발 환경과 배포 환경(AWS RDS) 간의 DB 스키마 불일치로 인해 배포 시 잦은 에러 발생.
- **해결**: **Flyway**를 도입하여 DB 변경 사항을 버전별 SQL 파일(`V1__init.sql` 등)로 관리. 서버 실행 시 자동으로 마이그레이션이 수행되도록 하여 환경 간 데이터 구조 일치성을 보장함.

---

### Security & Maintenance (RCE 취약점 대응)
- **이슈 (Issue)**: 개발 진행 중 React 및 Next.js 프레임워크에서 치명적인 **원격 코드 실행(RCE) 취약점**이 보고됨.
  - *CVE-2025-55182 (React)*
  - *CVE-2025-66478 (Next.js)*
- **대응 (Action)**: 프로젝트의 보안 안정성을 최우선으로 고려하여 즉각적인 마이그레이션 진행.
  - **Next.js**: `14.x` → **`16.0.7`** (Stable)
  - **React**: `18.x` → **`19.2.1`** (Stable)
- **결과 (Result)**: 보안 위협을 사전에 차단하고, React 19의 최신 기능을 수용하기 위해 호환되지 않는 라이브러리(`react-quill`)를 **`react-quill-new`**로 교체하여 안정적인 서비스 환경을 구축함.

---

## Key Features

| 구분 | 기능 | 설명 |
| :--- | :--- | :--- |
| **소개** | 단체 소개 | 연혁, 조직도, 오시는 길(지도 API) |
| **활동** | 갤러리 | 공연 사진 및 영상 아카이빙 (S3 연동) |
| **단원** | 전용 공간 | 악보/자료실, 연습 일정 캘린더, 공지사항 (권한 관리) |
| **소통** | 커뮤니티 | 방명록, 문의하기, 자유게시판 |
| **관리** | Admin | 회원 승인/관리, 콘텐츠 업로드, 배너 관리 |

---

## 📸 Service Screens
드림쇼 콰이어 홈페이지의 주요 기능 스크린샷입니다.

### 1. Main Page & Admin
합창단의 첫인상을 주는 메인 랜드마크와 관리자 전용 대시보드입니다.

| **Main Landing Page (Hero Section)** |
| :---: |
| <img src="https://github.com/user-attachments/assets/2118bed5-85c3-472f-947d-63504e7611bc" alt="Main Page" width="100%"> |
| **합창단 소개 및 공연 정보가 담긴 메인 화면** |

<br>

| **Admin Dashboard** |
| :---: |
| <img src="https://github.com/user-attachments/assets/6644eecf-a72b-4dbb-a8b2-f4dacb86c03a" alt="Admin Page" width="100%"> |
| **관리자 전용 배너/게시글 관리 페이지** |

<br>

### 2. Board System (React Quill New)
Rich Text 에디터를 적용하여 이미지 업로드와 스타일링이 가능합니다.

| **게시글 작성 (Write)** | **게시글 상세 (Read)** |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/7150b39f-0a9e-4bec-899d-6be9637c06c0" alt="Editor Write" width="100%"> | <img src="https://github.com/user-attachments/assets/0001411e-43ed-4b6e-85f6-e482ebf3f08c" alt="Editor Read" width="100%"> |

<br>

### 3. Authentication (Security)
OAuth2 및 JWT를 적용한 보안 로그인 프로세스입니다.

| **로그인 페이지** | **회원가입 폼** | **OAuth / 유효성 검사** |
| :---: | :---: | :---: |
| <img src="https://github.com/user-attachments/assets/bf5f2dc1-bd76-4a8a-b1c6-3d7a907e0630" alt="Login" width="100%"> | <img src="https://github.com/user-attachments/assets/1914feb0-b686-44ec-ae31-32dfe6ffe137" alt="Signup" width="100%"> | <img src="https://github.com/user-attachments/assets/c726228e-e9b2-40af-9994-3513c784bf6c" alt="Validation" width="100%"> |

<br>

### 4. Mobile Responsive
모바일 환경에서도 최적화된 레이아웃을 제공합니다.

| **모바일 메인** | **모바일 메뉴 (Hamburger)** |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/fdc48514-7806-47c4-8fdc-917e4f9937b7" alt="Mobile Main" width="100%"> | <img src="https://github.com/user-attachments/assets/51573a5e-2178-48c2-a430-e22a6659ef3b" alt="Mobile Menu" width="100%"> |

---

## System Architecture
```mermaid
graph LR
    User((User)) --> Nginx[Nginx Web Server]
    Nginx --> |Static/SSR| Next[Next.js Frontend]
    Nginx --> |API Request| Boot[Spring Boot Backend]
    Boot --> DB[(PostgreSQL)]
    Boot --> S3[AWS S3 Bucket]
````

-----

## Getting Started

로컬 환경에서 프로젝트를 실행하는 방법입니다.

### Prerequisites

  * JDK 17+
  * Node.js 18+
  * PostgreSQL

### 1\. Backend (Spring Boot)

```bash
# Clone Repository
git clone [https://github.com/dungeong/dreamshowchoir.git](https://github.com/dungeong/dreamshowchoir.git)

# Build & Run
cd dreamshowchoir
./gradlew bootRun
```

### 2\. Frontend (Next.js)

```bash
# Clone Repository
git clone [https://github.com/dungeong/dreamshowchoir-frontend.git](https://github.com/dungeong/dreamshowchoir-frontend.git)

# Install Dependencies
cd dreamshowchoir-frontend
npm install

# Run Development Server
npm run dev
```

-----
## 🗄️ ERD Evolution (Database Architecture)
프로젝트 진행 과정에서 요구사항 분석과 서비스 안정성을 위해 데이터베이스 구조를 지속적으로 고도화했습니다.

### 🚀 v1.0 vs v2.0 주요 변경 사항
초기 설계 단계에서 실제 개발을 진행하며 **보안, 데이터 안정성, 유지보수성**을 고려하여 스키마를 개선했습니다.

| 구분 | 초기 기획 (Draft) | 최종 구현 (Final) | 개선 이유 및 기술적 의사결정 |
| :--- | :---: | :---: | :--- |
| **보안 (Auth)** | User 테이블 단일 | **RefreshTokens 테이블 추가** | JWT 탈취 위험을 줄이기 위해 Refresh Token 도입 및 DB 저장 관리 |
| **삭제 정책** | Hard Delete | **Soft Delete (deleted_at)** | 실수로 삭제된 데이터 복구 및 참조 무결성 유지를 위해 논리적 삭제 적용 |
| **형상 관리** | 수동 관리 | **Flyway 도입** | `flyway_schema_history`를 통해 DB 스키마 변경 이력을 버전별로 관리 |
| **사용자** | User 통합 | **MemberProfile 분리** | 인증 정보(User)와 부가 정보(Profile)를 분리하여 확장성 확보 |

<br>

### 📅 Initial Draft ERD (Planning Stage)
<details>
<summary>초기 기획 단계의 ERD 보기 (클릭)</summary>
    
<img width="100%" alt="Initial ERD" src="https://github.com/user-attachments/assets/c60ad762-c841-4ac0-acbb-c59bdf188991" />

</details>

<br>

### 🛠️ Final Production ERD
현재 실제 서비스에 적용된 최종 데이터베이스 구조입니다.
<img width="100%" alt="Final ERD" src="https://github.com/user-attachments/assets/335255dc-7d6c-46ec-99fd-4453b61d1e55" />

-----

## 📝 Blog & Dev Log

백엔드 개발 과정을 기록했습니다.

http://polarized-pin-f6a.notion.site/2993293b6f8b8040aff0daf9543830d7?pvs=74

-----

## 👨‍💻 Contributor

  * [이동영/dungeong]

