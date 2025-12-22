
# 드림쇼콰이어 공식 홈페이지 (Dream Show Choir)

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

>사회적협동조합 드림쇼콰이어의 공식 정보 제공, 단원 관리 및 커뮤니티 활성화를 위한 웹 플랫폼입니다.

## 배포 링크
**홈페이지 바로가기 :** [https://dreamshowchoir.ulsan.kr](https://dreamshowchoir.ulsan.kr)

---

## Tech Stack

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?style=flat&logo=tailwind-css)

### Backend
![Java](https://img.shields.io/badge/Java-17-orange?style=flat&logo=java)
![Spring Boot](https://img.shields.io/badge/SpringBoot-3.2.3-brightgreen?style=flat&logo=springboot)
![Spring Security](https://img.shields.io/badge/Spring%20Security-6.0-green?style=flat&logo=springsecurity)
![JPA](https://img.shields.io/badge/JPA-Hibernate-59666C?style=flat&logo=hibernate)

### Infrastructure & DB
![AWS EC2](https://img.shields.io/badge/AWS%20EC2-Compute-orange?style=flat&logo=amazon-aws)
![AWS S3](https://img.shields.io/badge/AWS%20S3-Storage-yellow?style=flat&logo=amazon-s3)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0-336791?style=flat&logo=postgresql)
![Nginx](https://img.shields.io/badge/Nginx-Proxy-009639?style=flat&logo=nginx)

---

## ✨ Key Features

| 구분 | 기능 | 설명 |
| :--- | :--- | :--- |
| **소개** | 단체 소개 | 연혁, 조직도, 오시는 길(지도 API) |
| **활동** | 갤러리 | 공연 사진 및 영상 아카이빙 (S3 연동) |
| **단원** | 전용 공간 | 악보/자료실, 연습 일정 캘린더, 공지사항 (권한 관리) |
| **소통** | 커뮤니티 | 방명록, 문의하기, 자유게시판 |
| **관리** | Admin | 회원 승인/관리, 콘텐츠 업로드, 배너 관리 |

Main Landing Page - 합창단 소개 및 공연 정보
<img width="2516" height="1293" alt="screely-1766403251206" src="https://github.com/user-attachments/assets/2118bed5-85c3-472f-947d-63504e7611bc" />

Board Editor - Rich Text 에디터 및 이미지 업로드 기능
<img width="1949" height="1278" alt="screely-1766404001658" src="https://github.com/user-attachments/assets/7150b39f-0a9e-4bec-899d-6be9637c06c0" />
<img width="1451" height="1277" alt="screely-1766404082661" src="https://github.com/user-attachments/assets/0001411e-43ed-4b6e-85f6-e482ebf3f08c" />

Authentication - OAuth2 & JWT 기반 로그인 및 회원가입
<img width="1923" height="1263" alt="screely-1766404454280" src="https://github.com/user-attachments/assets/bf5f2dc1-bd76-4a8a-b1c6-3d7a907e0630" />
<img width="1245" height="1258" alt="screely-1766404426044" src="https://github.com/user-attachments/assets/c726228e-e9b2-40af-9994-3513c784bf6c" />
<img width="1952" height="1260" alt="screely-1766404414308" src="https://github.com/user-attachments/assets/1914feb0-b686-44ec-ae31-32dfe6ffe137" />

Admin Dashboard - 관리자 전용 페이지
<img width="2532" height="1312" alt="screely-1766404624384" src="https://github.com/user-attachments/assets/6644eecf-a72b-4dbb-a8b2-f4dacb86c03a" />

Mobile Responsive - 모바일 환경 최적화 UI
<img width="509" height="1076" alt="screely-1766404738553" src="https://github.com/user-attachments/assets/fdc48514-7806-47c4-8fdc-917e4f9937b7" />
<img width="506" height="1079" alt="screely-1766404749360" src="https://github.com/user-attachments/assets/51573a5e-2178-48c2-a430-e22a6659ef3b" />

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

## 📝 Blog & Dev Log

백엔드 개발 과정을 기록했습니다.

http://polarized-pin-f6a.notion.site/2993293b6f8b8040aff0daf9543830d7?pvs=74

-----

## 👨‍💻 Contributor

  * [이동영/dungeong]

