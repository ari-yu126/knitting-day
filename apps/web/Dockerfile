# apps/web용 Dockerfile
#
# npm workspaces 모노레포라서 빌드 컨텍스트는 저장소 루트로 잡아야 함:
#   docker build -f apps/web/Dockerfile -t knitting-day-web .
#
# next.config.js의 `output: "standalone"` 덕분에, 빌드 후 실행에 필요한 최소한의
# node_modules만 추려진 `.next/standalone` 폴더가 생김 — 이걸 그대로 실행 이미지에
# 옮기면 되기 때문에, 무거운 전체 node_modules를 실행 이미지에 넣지 않아도 됨.
# (프리티어 VM처럼 메모리가 작은 서버에서 특히 중요)

# ---- 1단계: 의존성 설치 ----
FROM node:20-slim AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

# ---- 2단계: Next.js 빌드 ----
FROM node:20-slim AS build
WORKDIR /repo
COPY --from=deps /repo ./
COPY apps/web apps/web

# 프론트가 브라우저에서 실제로 호출할 백엔드 주소. 빌드 시점에 값을 넣어줘야
# 정적 번들에 박히기 때문에 ARG로 받아서 ENV로 넘김 (docker build --build-arg로 전달)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build --workspace=apps/web

# ---- 3단계: 실행 이미지 ----
FROM node:20-slim AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# standalone 출력물은 모노레포 루트 기준 상대 경로(apps/web/...)를 그대로 유지해서 생성됨
COPY --from=build --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
# standalone에는 정적 자산(.next/static, public)이 빠져 있어서 따로 복사해야 함
COPY --from=build --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
