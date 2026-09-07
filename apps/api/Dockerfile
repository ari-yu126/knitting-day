# apps/api용 Dockerfile
#
# 이 프로젝트는 npm workspaces 모노레포(루트에 apps/api, apps/web)라서
# 빌드 컨텍스트는 반드시 "저장소 루트"로 잡아야 함:
#   docker build -f apps/api/Dockerfile -t knitting-day-api .
# (docker-compose.yml에서는 build.context: . / build.dockerfile: apps/api/Dockerfile 로 지정)

# ---- 1단계: 의존성 설치 ----
# api/web 두 워크스페이스의 package.json을 먼저 복사해서 npm이 워크스페이스 구조를
# 알 수 있게 함 (web 소스 전체는 필요 없음 — package.json만 있으면 npm ci가 동작함)
FROM node:20-slim AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

# ---- 2단계: TypeScript 빌드 ----
FROM node:20-slim AS build
WORKDIR /repo
COPY --from=deps /repo ./
COPY apps/api apps/api
RUN npm run build --workspace=apps/api

# ---- 3단계: 실행 이미지 ----
# devDependencies(typescript, tsx 등)는 실행에 필요 없어서 프로덕션 의존성만 새로 설치
FROM node:20-slim AS run
WORKDIR /repo
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --workspace=apps/api --omit=dev

COPY --from=build /repo/apps/api/dist apps/api/dist

WORKDIR /repo/apps/api
EXPOSE 4000
CMD ["node", "dist/server.js"]
