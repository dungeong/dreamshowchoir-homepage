
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
git clone [https://github.com/username/dreamshow-backend.git](https://github.com/username/dreamshow-backend.git)

# Build & Run
cd dreamshow-backend
./gradlew bootRun
```

### 2\. Frontend (Next.js)

```bash
# Clone Repository
git clone [https://github.com/username/dreamshow-frontend.git](https://github.com/username/dreamshow-frontend.git)

# Install Dependencies
cd dreamshow-frontend
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

