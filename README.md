# Knitting Day

웹 프론트엔드와 API 백엔드를 포함하는 풀스택 모노레포 프로젝트입니다.

## 📋 프로젝트 개요

현재 초기 세팅 단계로, Next.js 기반 웹 애플리케이션과 Express 기반 API 서버를 구성하고 있습니다.

## 🛠 기술 스택

### 루트
- **패키지 관리**: npm workspaces
- **동시 실행**: concurrently

### 웹 (`apps/web`)
- **프레임워크**: Next.js 16.2.4
- **라이브러리**: React 19.2.4
- **언어**: TypeScript 5
- **스타일링**: Tailwind CSS v4, Sass
- **린트**: ESLint

### API (`apps/api`)
- **프레임워크**: Express 5.2.1
- **언어**: TypeScript 6
- **데이터베이스**: PostgreSQL (pg 8.20.0)
- **개발 도구**: tsx (watch mode)
- **보안**: bcrypt
- **미들웨어**: cors, dotenv
- **문서화**: swagger-jsdoc, swagger-ui-express

## 📁 디렉터리 구조

```
knitting-day/
├── apps/
│   ├── web/          # Next.js 프론트엔드
│   │   ├── src/
│   │   │   ├── app/
│   │   │   └── styles/
│   │   │       ├── global.scss
│   │   │       ├── _variables.scss
│   │   │       └── _mixin.scss
│   │   └── package.json
│   └── api/          # Express 백엔드
│       ├── src/
│       │   ├── lib/
│       │   │   └── db.ts
│       │   └── server.ts
│       └── package.json
└── package.json      # 루트 workspace 설정
```

## 📦 사전 요구사항

- **Node.js**: v20 이상 권장
- **PostgreSQL**: 로컬 또는 원격 DB 인스턴스
- **npm**: v9 이상

## 🚀 설치 및 실행

### 설치

루트 디렉터리에서 모든 워크스페이스 의존성을 한 번에 설치합니다:

```bash
npm install
```

### 실행

**전체 실행 (웹 + API 동시)**
```bash
npm run dev
```

**개별 실행**
```bash
# 웹만 실행
npm run dev:web

# API만 실행
npm run dev:api
```

### 빌드 및 프로덕션

**웹 빌드**
```bash
cd apps/web
npm run build
npm run start
```

**API 빌드**
```bash
cd apps/api
npm run build
npm run start
```

## 🔧 환경 변수 설정

### API 환경 변수

`apps/api/.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/knitting_day
PORT=4000
```

- `DATABASE_URL`: PostgreSQL 연결 문자열 (필수)
- `PORT`: API 서버 포트 (기본값: 4000)

## 🌐 로컬 개발 URL

- **웹**: http://localhost:3000
- **API**: http://localhost:4000

## 📡 API 엔드포인트

### Health Check
```
GET /health
```

서버 상태 확인

**응답 예시:**
```json
{
  "status": "ok",
  "service": "knitting-day-api"
}
```

### Database Test
```
GET /db-test
```

PostgreSQL 연결 확인

**응답 예시:**
```json
{
  "status": "success",
  "time": {
    "now": "2026-05-06T06:08:00.000Z"
  }
}
```

## 💅 스타일 가이드

### 전역 스타일

- `apps/web/src/app/layout.tsx`에서 `global.scss`를 import
- Sass partials(`_variables.scss`, `_mixin.scss`)를 `@use`로 연결
- Tailwind CSS와 Sass를 함께 사용

### Sass 사용법

```scss
// global.scss에서
@use 'variables' as *;
@use 'mixin' as *;
```

## 📝 개발 스크립트

### 루트
```json
{
  "dev": "웹과 API 동시 실행",
  "dev:web": "웹만 실행",
  "dev:api": "API만 실행"
}
```

### 웹 (`apps/web`)
```json
{
  "dev": "개발 서버 시작",
  "build": "프로덕션 빌드",
  "start": "프로덕션 서버 시작",
  "lint": "ESLint 실행"
}
```

### API (`apps/api`)
```json
{
  "dev": "watch 모드로 개발 서버 시작",
  "build": "TypeScript 컴파일",
  "start": "컴파일된 서버 실행"
}
```

## 📄 라이선스

ISC

## 🔗 링크

- **Repository**: https://github.com/ari-yu126/knitting-day
- **Issues**: https://github.com/ari-yu126/knitting-day/issues

## 🤝 기여

현재 초기 개발 단계입니다.
