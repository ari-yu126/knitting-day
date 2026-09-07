# Knitting Day (뜨개한 날)

뜨개 일기를 기록하는 커뮤니티 MVP입니다.  
Next.js 프론트 + Express API + PostgreSQL을 npm workspaces 모노레포로 구성했습니다.

## 프로젝트 개요

회사 스터디 과제용 풀스택 서비스로, **로그인 기반 CRUD**를 중심으로 구현했습니다.

| 영역   | 구현                                                      |
| ------ | --------------------------------------------------------- |
| 인증   | 이메일/비밀번호 로그인, JWT, 이메일 인증 회원가입, bcrypt |
| 게시판 | 작성·목록·상세·수정·삭제 (본인만 수정/삭제)               |
| 댓글   | 작성·조회·삭제 (본인만 삭제)                              |
| 페이징 | 서버 `LIMIT/OFFSET` + UI 페이지네이션                     |
| 문서   | Swagger (`/api-docs`)                                     |
| 배포   | Docker + GitHub Actions + GCP VM (`main` 브랜치)          |

## 기술 스택

| 구분     | 기술                                                                                 |
| -------- | ------------------------------------------------------------------------------------ |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Sass, zustand, axios |
| Backend  | Node.js, Express 5, TypeScript, JWT, bcrypt, nodemailer                              |
| Database | PostgreSQL 16 (`pg`)                                                                 |
| Docs     | swagger-jsdoc, swagger-ui-express                                                    |
| Infra    | Docker, Docker Compose, GitHub Actions → GHCR, GCP VM                                |

## 디렉터리 구조

```
knitting-day/
├── apps/
│   ├── web/                 # Next.js 프론트
│   │   └── src/
│   │       ├── app/         # 페이지 (login, signup, stitchday, mypage…)
│   │       ├── components/
│   │       ├── features/
│   │       ├── lib/         # axios 인스턴스 등
│   │       └── store/       # useAuthStore (zustand)
│   └── api/                 # Express API
│       ├── sql/schema.sql
│       └── src/
│           ├── routes/      # auth, posts, comments, users
│           ├── middleware/  # jwtAuth
│           ├── lib/         # db, mailer
│           ├── swagger.ts
│           └── server.ts
├── .github/workflows/       # 배포 Actions
├── docker-compose.yml       # 로컬 (Postgres / 전체 빌드)
├── docker-compose.prod.yml  # 배포 (GHCR 이미지 pull)
└── package.json             # npm workspaces
```

## 사전 요구사항

- Node.js 20+
- npm 9+
- Docker (로컬 Postgres / 배포용)

## 로컬 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. PostgreSQL 실행

```bash
docker compose up -d postgres
```

기본 접속 정보:

- User: `knittingday`
- Password: `1234`
- DB: `knitting_day`
- Port: `5432`

### 3. 스키마 적용

```bash
psql postgresql://knittingday:1234@localhost:5432/knitting_day -f apps/api/sql/schema.sql
```

(이미 테이블이 있으면 생략)

### 4. 환경 변수

**API** — `apps/api/.env`

```env
DATABASE_URL=postgresql://knittingday:1234@localhost:5432/knitting_day
PORT=4000
JWT_SECRET=your-secret-key
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

**Web** — `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> `.env` / `.env.local`은 git에 커밋하지 않습니다.

### 5. 개발 서버 실행

```bash
# 웹(3000) + API(4000) 동시
npm run dev

# 개별
npm run dev:web
npm run dev:api
```

### 로컬 URL

| 서비스  | URL                            |
| ------- | ------------------------------ |
| Web     | http://localhost:3000          |
| API     | http://localhost:4000          |
| Swagger | http://localhost:4000/api-docs |

## API 요약

상세 스펙·Try it out은 **Swagger**를 보세요.

### Auth

| Method | URL                 | 설명              | 인증 |
| ------ | ------------------- | ----------------- | ---- |
| GET    | `/auth/check-email` | 이메일 중복 확인  | -    |
| POST   | `/auth/send-code`   | 인증코드 발송     | -    |
| POST   | `/auth/verify-code` | 인증코드 검증     | -    |
| POST   | `/auth/signup`      | 회원가입          | -    |
| POST   | `/auth/login`       | 로그인 · JWT 발급 | -    |

### Users

| Method | URL         | 설명         | 인증 |
| ------ | ----------- | ------------ | ---- |
| GET    | `/users/me` | 내 정보 조회 | JWT  |

### Posts

| Method | URL                   | 설명                              | 인증 |
| ------ | --------------------- | --------------------------------- | ---- |
| GET    | `/posts?page=1`       | 목록 (페이징, `userId` 필터 가능) | -    |
| GET    | `/posts/:postId`      | 상세                              | -    |
| POST   | `/posts`              | 작성                              | JWT  |
| PUT    | `/posts/:postId`      | 수정 (본인)                       | JWT  |
| DELETE | `/posts/:postId`      | 삭제 (본인)                       | JWT  |
| POST   | `/posts/:postId/like` | 좋아요                            | JWT  |
| DELETE | `/posts/:postId/like` | 좋아요 취소                       | JWT  |

### Comments

| Method | URL                       | 설명             | 인증 |
| ------ | ------------------------- | ---------------- | ---- |
| GET    | `/posts/:postId/comments` | 댓글 목록        | -    |
| POST   | `/posts/:postId/comments` | 댓글 작성        | JWT  |
| PUT    | `/comments/:commentId`    | 댓글 수정 (본인) | JWT  |
| DELETE | `/comments/:commentId`    | 댓글 삭제 (본인) | JWT  |

### Health

| Method | URL        | 설명         |
| ------ | ---------- | ------------ |
| GET    | `/health`  | 서버 상태    |
| GET    | `/db-test` | DB 연결 확인 |

## 인증 흐름 (요약)

1. `POST /auth/login` 성공 → JWT 발급 (`userId`, `email`, 만료 3시간)
2. 프론트 `useAuthStore` + localStorage에 토큰 저장
3. axios interceptor가 `Authorization: Bearer <token>` 자동 첨부
4. 보호 API는 `auth` 미들웨어로 `jwt.verify` — 실패 시 401
5. 프론트는 401 시 공통 로그아웃 처리

## 빌드

```bash
# Web
npm run build --workspace=apps/web

# API
npm run build --workspace=apps/api
npm run start --workspace=apps/api
```

## Docker / 배포

- **로컬 전체 컨테이너**: `docker compose up -d --build`  
  (루트 `.env`에 `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASSWORD`, `NEXT_PUBLIC_API_URL` 필요)
- **배포**: GitHub Actions가 api/web 이미지를 GHCR에 푸시 → GCP VM에서 `docker-compose.prod.yml`로 pull & 실행
- **서버 `.env`** (`~/knitting-day/.env`): `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASSWORD`, `SWAGGER_SERVER_URL`  
  (`SWAGGER_SERVER_URL` 예: `http://<VM 공인 IP>:4000` — Swagger UI Try it out용)
- 배포용 GitHub Secrets 목록은 `.github/workflows/deploy.yml` 하단 주석 참고

## 스크립트

| 위치 | 명령                               | 설명               |
| ---- | ---------------------------------- | ------------------ |
| 루트 | `npm run dev`                      | web + api 동시     |
| 루트 | `npm run dev:web` / `dev:api`      | 개별 실행          |
| web  | `npm run build` / `start` / `lint` | 빌드 · 실행 · 린트 |
| api  | `npm run build` / `start`          | tsc 빌드 · 실행    |

## 링크

- Repository: https://github.com/ari-yu126/knitting-day
- Issues: https://github.com/ari-yu126/knitting-day/issues

## License

ISC
