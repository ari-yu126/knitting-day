# 발표/평가 대비 설명 노트

작업하면서 정리된 "왜 이렇게 설계했는가"를 카테고리별로 누적하는 문서입니다.
나중에 노션으로 그대로 옮겨서 발표 자료로 쓰면 됩니다.

---

## 현재 진행 상황 요약 (최종 점검)

### 주요 항목 (표시 있는 게 필수)

- Backend(Node.js/Express) ✅ / DB(PostgreSQL) ✅ / API(REST) ✅ / Frontend(Next.js·TypeScript) ✅ — 필수 표시된 4개 전부 충족.
- Swagger ✅ — 필수 표시는 없었지만 처음부터 구현.
- Cloud Server / Docker(앱 컨테이너화) / GitHub Actions 자동배포 ❌ — 아직 미착수. (지금은 `docker-compose.yml`에 Postgres만 컨테이너로 띄우고, api/web은 로컬에서 직접 실행 중.) 원래 항목 설명에도 필수 표시가 없는 선택 영역.

### 주요 로직 (필수 구현) — 전부 완료

- 로그인 ✅ — JWT 발급, 인증이 필요한 모든 API가 `auth` 미들웨어로 보호됨.
- 회원가입 ✅ — 이메일 중복검사·이메일 인증(실제 발송)·bcrypt 암호화·사용자 정보 저장 전부 연결.
- 게시판 ✅ — 로그인 사용자만 작성 가능, 본인 글만 수정/삭제 가능(403), 작성/목록조회/상세조회/수정/삭제 프론트-백엔드 전부 연결.
- 댓글 ✅ — 로그인 사용자만 작성 가능, 본인 댓글만 삭제 가능(403), 작성/조회/삭제 전부 연결.
- 페이징 ✅ — 게시글 목록 조회 시 서버 `LIMIT/OFFSET` + 프론트 페이지네이션 UI 연결.

### 추가 구현 (선택)

- 좋아요 기능 ✅ 구현 완료. 게시글 검색 ❌, 파일 업로드 ❌, 프로필 수정 ❌ — 미구현(선택 사항이라 의도적으로 스킵).

### 배포 계획 (진행 예정)

- 구조: GCE(Compute Engine) VM 한 대 + Docker Compose로 db/api/web 세 컨테이너를 한 곳에서 실행. 이미지 빌드는 GitHub Actions(무료 러너)에서 하고, VM은 완성된 이미지를 받아서 실행만 담당 — 무료 티어 VM(RAM 1GB)의 빌드 부담을 줄이기 위한 선택.
- 일정: 코드 쪽(Dockerfile 2개, compose 확장, Actions workflow)은 제출 전날 밤 미리 준비. 실제 GCP 콘솔 설정(프로젝트/VM/방화벽/시크릿 등록)과 첫 배포는 제출 당일 진행 — 막히면 배포는 포기하고 로컬 시연으로 전환(필수 기능은 이미 완료된 상태라 제출 자체엔 지장 없음).

---

## 인증 (JWT)

- **JWT에 담은 정보**: `userId`, `email` (payload)
  - `userId`는 users 테이블의 자동 생성 PK. posts/comments의 `user_id`(FK)와 비교할 때 필요해서 포함.
  - `email`은 표시용/부가 정보로 포함.
- **토큰 발급 방식**: 로그인 성공(`bcrypt.compare` 통과) 시 `jwt.sign(payload, JWT_SECRET, { expiresIn: "3h" })`로 발급.
- **비밀키(JWT_SECRET) 개념**: 서버만 아는 값(.env, git에는 커밋 안 됨). 토큰 발급 시 서명을 만드는 데 쓰이고, 검증 시에도 같은 키로 서명을 재계산해서 대조함 — 서버가 발급한 토큰을 별도로 저장해뒀다가 비교하는 방식이 아니라, 서명을 그 자리에서 재검증하는 방식(그래서 상태를 안 남겨도 됨 = REST의 무상태성과 맞음).
- **인증 API 보호 방식**: `middleware/jwtAuth.ts`의 `auth` 미들웨어가 `Authorization: Bearer <token>` 헤더를 확인 → `jwt.verify`로 서명 검증 → 성공 시 `req.user`에 payload 저장, 실패 시 401.
- **토큰 저장 위치(프론트)**: zustand(메모리) + localStorage 병행.
  - 메모리(zustand): 세션 중 빠른 접근용, 컴포넌트가 구독해서 리렌더링 트리거.
  - localStorage: 새로고침해도 로그인 상태가 사라지지 않도록 영속 저장.
  - 자세한 구현/SSR·hydration 이슈는 아래 "프론트엔드 상태관리", "공통 401 처리 + 로그인 상태 검증" 섹션 참고.

---

## DB 설계

- **users vs email_verifications 테이블 분리 이유**: 인증 "과정"(email_verifications: 인증번호, 만료시간, 인증 완료 시각)과 "가입 완료된 사용자 상태"(users: is_email_verified, 비밀번호 해시 등)를 역할별로 분리. 인증 시도가 여러 번(재전송) 있을 수 있어 email_verifications는 한 이메일당 여러 행이 쌓일 수 있고, 최신 인증 기록만 유효하게 취급(`ORDER BY created_at DESC LIMIT 1`).
- **비밀번호**: 평문 저장 안 함. `bcrypt.hash(password, 10)`으로 해시만 저장. 로그인 시 `bcrypt.compare`로 검증(원문 복원 불가능한 단방향 해시라서 저장된 값과 직접 비교 불가).
- **posts/comments의 user_id**: users.id(PK)를 참조하는 FK. 회원가입 시 사용자가 직접 입력하는 값이 아니라 DB가 자동 생성(SERIAL) → 로그인 시 조회해서 JWT에 실어 보냄 → 이후 요청마다 `req.user.userId`로 꺼내 씀.
- **댓글 URL 설계**: 댓글 목록/작성은 게시글 컨텍스트가 필요해 `/posts/:postId/comments`, 댓글 수정/삭제는 댓글 고유 id만으로 특정 가능해 `/comments/:commentId`로 분리.

---

## API 설계 (REST)

- URL은 자원(resource), HTTP 메서드는 행동(action)을 나타내는 REST 컨벤션을 따름.
  - `GET /posts` 목록, `GET /posts/:id` 상세, `POST /posts` 작성, `PUT /posts/:id` 수정, `DELETE /posts/:id` 삭제
- **API 문서화**: Swagger(swagger-jsdoc + swagger-ui-express)로 각 라우트에 요청/응답 스펙, 인증 필요 여부(`bearerAuth`)를 JSDoc 주석으로 명시 → `/api-docs`에서 확인 및 테스트 가능.
- **공통 에러 처리**: 모든 라우트에서 `try/catch`로 감싸고, DB/서버 에러는 500, 클라이언트 입력 문제는 400, 인증 실패는 401, 권한 없음은 403, 자원 없음은 404로 구분해서 응답.
- **본인 게시글/댓글만 수정·삭제 가능**: DB에서 조회한 작성자 id(`user_id`, 신뢰 가능한 값)와 JWT에서 꺼낸 현재 로그인 사용자 id를 비교. 클라이언트가 보낸 값(req.body)은 조작 가능하므로 절대 신뢰하지 않음.

---

## 프론트엔드 상태관리

- **선택 라이브러리**: zustand
  - 필수 스택은 아니었음(자유 선택 항목). Redux 대비 보일러플레이트가 적고, 이 프로젝트 규모(로그인 상태 하나 정도 전역 관리)에 적합하다고 판단.
- **Store로 관리할 상태**: `token`, `email`, `nickname`, `userId` (useAuthStore)
  - 로그인 상태 유지 방식: zustand(메모리) + localStorage 이중 저장. 각 setter(`setToken`/`setEmail`/`setNickname`/`setUserId`)와 `logout`이 호출될 때마다 zustand 상태와 localStorage를 동시에 갱신.
  - 초기값은 `localStorage.getItem(...)`으로 복원 → 새로고침해도 로그인 상태 유지.
  - 값이 `null`이면 `localStorage.removeItem`, 값이 있으면 `localStorage.setItem` — `setItem`이 문자열만 받기 때문.
  - **SSR 이슈 및 해결**: Next.js의 `stitchday/page.tsx` 같은 서버 컴포넌트는 서버(Node.js)에서도 렌더링되는데, 서버 환경엔 브라우저 전용 객체인 `localStorage`가 없어서 `localStorage.getItem is not a function` 에러 발생. `typeof window !== "undefined"` 체크로 해결 — `window`는 브라우저에만 존재하는 전역 객체라서, 서버에서 실행 중이면 `false`가 되어 초기값을 `null`로 두고, 브라우저에서 실행될 때만 실제 `localStorage` 값을 읽어오도록 분기 처리함. (반면 `setToken`/`logout` 같은 함수들은 로그인 버튼 클릭 등 사용자 이벤트에서만 호출되므로 서버에서 먼저 실행될 일이 없어 별도 가드가 필요 없음.)
  - **Hydration mismatch 이슈 및 해결**: 위 SSR 가드 덕분에 에러는 안 나지만, 새로운 문제가 생김 — 서버는 항상 "로그아웃 상태"(`token: null`)로 HTML을 그리는데, 브라우저에서 스토어가 로드되는 순간 `localStorage`의 실제 토큰값을 즉시 읽어버려서, 브라우저의 첫 렌더링 결과가 "로그인 상태"로 서버 결과와 달라짐 → React가 "서버와 클라이언트 렌더링 결과가 다르다"며 hydration 에러 발생. 해결: 컴포넌트에 `mounted`라는 state를 추가해서 처음엔 `false`로 시작 → `useEffect`에서 `true`로 바꿔줌. 로그인 여부를 판단할 때 `mounted && token값`처럼 `mounted`가 `true`가 되기 전까지는 무조건 "로그아웃 상태"로 렌더링해서 서버 결과와 클라이언트의 첫 렌더링을 일치시키고, `useEffect`가 실행된 다음(=화면에 이미 자리잡은 다음)에만 실제 로그인 상태를 반영함. `Header`, `CommentSection`, 글쓰기/수정/마이페이지 가드, `PostOwnerActions` 등 인증 UI 전반에 적용.

---

## API 연동 구조

- axios 인스턴스(`src/lib/api.ts`)에 `baseURL`을 환경변수(`NEXT_PUBLIC_API_URL`)로 설정.
- **인증 토큰 전달 방식**: axios request interceptor에서 매 요청마다 `useAuthStore.getState().token`으로 현재 토큰을 꺼내 `Authorization: Bearer <token>` 헤더에 자동으로 실어 보냄. 컴포넌트마다 매번 헤더를 직접 넣을 필요 없음.
  - (참고) interceptor는 리액트 렌더링 흐름 밖에서 실행되므로 훅(`useAuthStore()`)이 아니라 zustand의 `getState()`로 스토어 값을 직접 읽음.
  - 반면 리액트 컴포넌트 "안"에서 스토어 값을 쓸 때는 훅 형태로 사용: `const setAuthToken = useAuthStore((state) => state.setToken);`
- **회원가입/로그인 페이지 연결 완료**: check-email, send-code, verify-code, signup, login 전부 axios로 실제 백엔드와 연결. 로그인 성공 시 응답의 `token`과 `user: { id, email, nickname }`을 `useAuthStore`에 저장(`token`/`email`/`nickname`/`userId`) → 이후 요청에 자동으로 인증 토큰 첨부됨.
- **공통 에러 처리 패턴(프론트)**: 각 요청을 `try/catch`로 감싸고, 성공 시 다음 로직 진행, 실패(예외 발생) 시 즉시 `catch`로 점프해서 사용자에게 에러 메시지(toast 등)를 보여줌 — 백엔드와 동일한 try/catch 기반 에러 처리 철학을 프론트에도 그대로 적용.
- **서버 vs 프론트 에러 처리의 역할 차이**: 서버의 `try/catch`는 서버 프로세스가 죽지 않고 적절한 상태 코드(400/401/403/404/500)로 응답하게 하기 위한 것. 프론트의 `try/catch`는 그 에러 응답을 받아서 사용자에게 실패를 알리거나 화면 상태를 정리하기 위한 것 — 목적이 달라서 양쪽 다 필요함.

---

## 게시글 상세/댓글 페이지 연동

- **JOIN 시 컬럼명 충돌**: `posts`와 `users`를 JOIN할 때 양쪽 다 `id` 컬럼이 있어서, `SELECT *`나 `WHERE id = $1`처럼 테이블명을 안 붙이면 "column reference is ambiguous" 에러 발생. `SELECT posts.*`, `WHERE posts.id = $1`처럼 테이블명을 명시해서 해결. 같은 이유로 댓글 목록 조회도 `SELECT comments.*, users.nickname FROM comments JOIN users ...`로 처리.
- **댓글 작성자 이름도 JOIN 필요**: `comments` 테이블엔 `user_id`(FK)만 있고 닉네임이 없어서, 게시글과 마찬가지로 `users` 테이블과 JOIN해서 닉네임을 받아옴.
- **이전글/다음글**: `id ± 1`로 가정하면 삭제·비연속 ID에서 404가 남. 상세 API(`GET /posts/:id`)가 현재 글의 `created_at` 기준으로 이전/다음 글(`prevPost`/`nextPost`)을 같이 내려주고, 프론트는 `response.data.prevPost` / `nextPost`만 사용. 없으면 `null`이라 화면에서 링크를 안 그림.
- **JSX와 try/catch 분리**: React는 JSX를 즉시 렌더링하지 않으므로 `try` 블록 안에 `return (JSX)`를 두면 에러를 제대로 못 잡음(React 자체 경고). 그래서 데이터를 담을 변수는 함수 최상단에 `let`으로 선언해두고, `try` 안에서는 값만 대입, `return`은 `try/catch` 바깥에 두는 구조로 처리. 메인 게시글/댓글 조회 실패 시에는 `notFound()`로 페이지 전체를 404 처리.
- **본인 댓글만 삭제 가능**: 로그인한 사용자의 `userId`(`useAuthStore`)와 각 댓글의 `user_id`를 `Number()`로 맞춰 비교해서, 일치할 때만 삭제 버튼을 노출. (초기에 닉네임 비교를 썼다가, 식별 안정성 때문에 `userId`로 바꿈 — 아래 "댓글 시스템 보완" 참고.)
- **삭제 함수를 자식 컴포넌트로 전달(콜백 prop)**: 댓글 목록/상태(`comments`)는 `CommentSection`이 갖고 있지만, 삭제 버튼은 그 안의 `Comment`(자식) 컴포넌트에 있음. 자식은 부모의 state를 직접 못 바꾸므로, 부모에서 만든 `deleteComment` 함수 자체를 prop으로 자식에게 내려주고(`onDelete`), 자식은 버튼 클릭 시 그 함수를 호출만 함 — 실제 상태 변경은 여전히 부모에서 일어남 (React의 "상태 끌어올리기" 패턴).
- **작성/삭제 후 화면 갱신 방식**: 백엔드가 작성/삭제 성공 시 메시지만 반환하고 최신 댓글 목록은 안 주기 때문에, 성공 후 `GET` 목록 조회를 다시 호출해서 최신 상태로 화면을 갱신하는 방식을 일관되게 사용.

---

## 댓글 시스템 보완 (2차)

- **본인 판별을 닉네임 → `userId`로 변경**(현재 기준): 초기에 닉네임 문자열 비교로 삭제 버튼을 노출했다가, 닉네임은 화면에 값이 없거나(로그인 직후 갱신 전) 같은 값이 우연히 겹치는 경우를 완전히 배제하기 어려워 `users.id`(PK)로 바꿈. 로그인 응답(`/auth/login`)에 `user: { id, email, nickname }`을 포함시키고, 프론트 `useAuthStore`에 `userId`를 추가로 저장 → 댓글의 `user_id`와 `Number()`로 형변환 후 비교(문자열/숫자 타입 불일치 방지).
- **비로그인 사용자 UX**: 로그인 안 한 상태로 상세 페이지에 들어오면 댓글 작성란 자체를 숨기고, "댓글을 작성하려면 로그인이 필요해요" 안내 + 로그인 페이지 링크를 보여줌. `useAuthStore`의 `token` 존재 여부로 판단.
- **`posts.comment_count` 동기화**: 댓글 작성/삭제 API에서 `comments` 테이블만 바꾸고 끝나면, `posts.comment_count`(목록/상세에 보여주는 캐시된 숫자)가 실제 댓글 수와 어긋남. 그래서 댓글 작성 성공 시 `UPDATE posts SET comment_count = comment_count + 1`, 삭제 성공 시 `UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0)`을 함께 실행해서 항상 최신 상태로 유지(음수 방지를 위해 `GREATEST` 사용).
- **공통 에러 메시지 유틸(`getApiErrorMessage`)**: `lib/api.ts`에 axios 에러에서 백엔드가 보낸 `message`를 안전하게 꺼내는 함수를 만들어, 각 페이지에서 `console.error`만 하고 끝나던 것을 화면에 실제 에러 문구(빨간 텍스트/토스트)로 보여주도록 개선. 백엔드 메시지가 없거나 형식이 다르면 기본 안내 문구로 대체.

---

## 게시글 수정/삭제 (프론트 연결)

- **백엔드는 이미 있었는데 프론트에서 안 부르고 있던 문제**: `PUT/DELETE /posts/:postId`는 이미 구현돼 있었지만, 프론트 어디에서도 호출하지 않아서 "본인 게시글만 수정/삭제 가능"이라는 요구사항이 화면상으로는 검증 불가능한 상태였음. `PostOwnerActions.tsx`(수정/삭제 버튼)와 `stitchday/[id]/edit/page.tsx`(수정 폼)를 새로 추가해서 연결.
- **본인 게시글 여부 판단**: 상세 페이지는 서버 컴포넌트라 `useAuthStore`(클라이언트 훅)를 직접 못 씀 → 서버에서 받아온 `postUserId`(게시글 작성자 id)를 별도의 작은 클라이언트 컴포넌트(`PostOwnerActions`)에 prop으로 내려주고, 그 컴포넌트 안에서 `useAuthStore`의 `userId`와 비교해서 일치할 때만 수정/삭제 버튼을 보여줌. (댓글 삭제 버튼과 같은 구조 — "서버 컴포넌트가 데이터를 가져오고, 작은 클라이언트 컴포넌트가 상호작용을 담당" 패턴을 게시글에도 그대로 적용.)
- **수정 페이지는 클라이언트 컴포넌트로 별도 구현**: `[id]/edit/page.tsx`는 진입 시 `GET /posts/:id`로 기존 내용을 불러와 폼에 채워 넣고, 저장 시 `PUT /posts/:id`로 전송. 작성자가 아닌데 URL로 직접 들어오는 경우를 대비해 불러온 게시글의 `user_id`와 로그인한 `userId`를 한 번 더 비교(방어적 체크 — 실제 차단은 백엔드 403이 최종 책임짐).
- **글쓰기 페이지 로그인 가드**: 비로그인 상태로 `/stitchday/write`에 접근하면 폼 대신 "로그인이 필요해요" 안내를 보여주고 `/login`으로 자동 이동시킴 — `useAuthStore`의 `token` 존재 여부로 판단. (마운트 전/후 값이 다를 수 있어 `mounted` 가드도 함께 적용해 hydration 에러 방지.)
- **로그인 후 원래 페이지로 복귀(`redirect` 쿼리 파라미터)**: 헤더/댓글창의 "로그인" 링크에 `?redirect=현재경로`를 붙이고, 로그인 성공 시 그 값으로 이동(없으면 기본값 `/stitchday`) — 메인에서 로그인하면 메인으로, 게시판에서 하면 게시판으로 돌아가도록.

---

## 마이페이지 (`GET /users/me`)

- **JWT로 "나"를 식별**: 프론트가 사용자 id를 직접 요청에 실어보내지 않고, `auth` 미들웨어가 검증한 JWT에서 `userId`를 꺼내 그 사람 정보만 조회 — 다른 사람 정보를 조회할 수 없도록 원천 차단.
- **응답에서 비밀번호 제외**: `SELECT id, email, nickname, created_at`만 조회해서 비밀번호 해시가 응답에 아예 안 담기게 함.
- **마이페이지 접근도 로그인 가드**: 비로그인 상태로 `/mypage`에 들어오면 `/login?redirect=/mypage`로 이동.
- **"내가 쓴 글" 목록 연결 완료**: `GET /posts`에 `userId` 쿼리 파라미터를 추가해서(있으면 `WHERE posts.user_id = $1`로 필터링, 없으면 기존처럼 전체 조회) 마이페이지에서 `GET /posts?userId=내id`로 조회하도록 연결. 하나의 목록 API를 "전체 목록"과 "내 글 목록" 양쪽에 재사용하는 방식(REST에서 쿼리 파라미터로 조회 범위를 좁히는 흔한 패턴). "받은 좋아요"도 이 목록에서 실제 `like_count` 합계로 계산. ("스크랩", "프로필 수정"은 관련 기능 자체가 없어서 여전히 자리만 있는 상태.)

---

## 게시글 좋아요 (실제 연동)

- **문제**: 상세 페이지의 좋아요 버튼(`PostActions.tsx`)이 로컬 `useState`만 토글할 뿐 서버에 반영되지 않아서, 새로고침하면 사라지고 `posts.like_count`도 항상 그대로였음. 그래서 마이페이지 "받은 좋아요" 합계도 항상 0으로 보였던 것.
- **해결**: `POST /posts/:postId/like`(+1), `DELETE /posts/:postId/like`(-1, `GREATEST`로 0 미만 방지) 두 개를 추가. 댓글의 `comment_count` 동기화와 동일한 "카운트 컬럼을 직접 증감시키는" 패턴.
- **범위를 의도적으로 좁힘**: 별도의 `likes` 테이블(누가 어떤 글에 좋아요를 눌렀는지 기록)은 만들지 않음 — 그래서 "이미 좋아요 누른 글인지" 상태는 새로고침하면 초기화되고, 같은 사람이 같은 글에 여러 번 좋아요를 누르는 것도 막지 않음. 과제 필수 요구사항에는 없는 기능이라 마감 시간 안에서 "숫자가 실제로 DB에 반영된다"는 것까지만 구현. 중복 방지가 필요해지면 `likes(user_id, post_id)` 복합 유니크 테이블을 추가하는 방향으로 확장 가능.
- **로그인 가드**: 비로그인 상태로 좋아요를 누르면 요청 대신 `/login?redirect=현재경로`로 이동 (댓글/글쓰기와 동일한 패턴).

---

## 이메일 인증 (실제 발송)

- nodemailer + Gmail SMTP로 실제 이메일 발송 구현. `lib/mailer.ts`에 `nodemailer.createTransport({ service: "gmail", auth: { user, pass } })`로 transporter를 만들어 export (DB 연결 풀을 `lib/db.ts`에 분리한 것과 같은 패턴).
- Gmail은 일반 로그인 비밀번호로는 SMTP 인증이 안 되고, 구글 계정의 "앱 비밀번호"(2단계 인증 필요)를 별도로 발급받아 `.env`에 저장해서 사용.
- 인증번호는 여전히 `email_verifications` 테이블에 저장 후 검증하는 기존 로직 그대로 유지 — 발송 방식만 콘솔 로그에서 실제 메일 발송으로 교체.

---

## 공통 401 처리 + 로그인 상태 검증

> **한 줄 요약**
> - 401이면 interceptor가 logout하고, mypage/write 등은 token을 구독해서 로그인으로 보낸다.
> - 새로고침 후 localStorage에서 token 복원 → Header에서 `/users/me`로 유효성 확인 → 실패 시 401 interceptor가 logout.

- **문제(기존)**: axios엔 요청 인터셉터(토큰 자동 첨부)만 있었고, 토큰이 만료/위조돼서 서버가 401을 줘도 프론트에서 그걸 감지해서 로그아웃시키는 공통 로직이 없었음. 그래서 토큰이 죽었는데도 로그인 상태처럼 보이는 화면이 남아있을 수 있었음.
- **해결**: `lib/api.ts`에 axios **response interceptor**를 추가. 응답이 401이면 `useAuthStore.getState().logout()`을 호출해서 스토어와 localStorage를 한 번에 초기화.
  - 여기서 `router.push`로 직접 페이지 이동을 시키지 않은 이유: 이 파일은 axios 인스턴스라 React 컴포넌트 트리 밖 → `useRouter` 훅을 못 씀. 대신 마이페이지/글쓰기 페이지가 이미 `token`을 zustand로 구독해서 "토큰 없으면 `/login`으로" 가드를 걸어두고 있어서, 여기서 토큰만 비워주면 그 가드가 알아서 재사용됨(중복 구현 안 해도 됨).
  - 결과적으로 "인증 실패는 어떻게 처리되는가?"에 대한 답: 서버가 401을 주는 모든 요청(글/댓글 작성·수정·삭제, 좋아요, 마이페이지 조회 등)에 대해 프론트에서 동일한 한 곳(interceptor)에서 로그아웃 처리를 하고, 보호된 페이지는 그걸 감지해서 로그인 페이지로 돌려보낸다.
- **로그인 상태를 "진짜로" 확인하는 흐름**: 지금까지는 `token`이 localStorage에 있으면(=존재하기만 하면) 무조건 "로그인 상태"로 화면을 그렸음 — 그 토큰이 서버 기준으로 아직 유효한지는 실제로 써보기 전까진 몰랐음. 이제 `Header.tsx`가 마운트되고 토큰이 있으면 `GET /users/me`를 한 번 호출해서 그 토큰이 실제로도 유효한지 서버에 확인한다.
  - 만료/위조된 토큰이면 401 → 위의 공통 처리로 로그아웃 → `hasToken`이 `false`가 되면서 Header가 자동으로 "로그아웃" 상태로 다시 그려짐.
  - 발표 질문 대비: **"새로고침 후 로그인 상태를 어떻게 유지/확인하나?"** → 유지는 새로고침 시 zustand 스토어가 localStorage에서 `token`을 복원하는 방식(초기값을 `localStorage.getItem`으로 세팅). 확인(검증)은 두 단계: ① Header가 마운트되면서 `/users/me`를 한 번 호출해 실제 유효성을 서버에 확인하고, ② 그 외에도 인증이 필요한 아무 API나 호출하는 순간 서버가 매번 재검증(401이면 위 공통 처리로 즉시 로그아웃)한다. 즉 "토큰이 있다"와 "로그인 상태가 유효하다"를 구분해서, 후자는 항상 서버가 최종 판단한다.

---

## 게시글 수정 페이지 로그인 가드 보완

- **문제**: 글쓰기 페이지(`/stitchday/write`)는 비로그인이면 `/login`으로 리다이렉트하는 가드가 있었는데, 수정 페이지(`/stitchday/[id]/edit`)엔 이 가드가 빠져 있었음. 그래서 비로그인 사용자가 URL을 직접 입력해서 들어오면 폼 자체는 그대로 보이고, 제출할 때만 백엔드 401로 막히는 상태였음 — 접근 제어 관점에서 일관성이 없었음.
- **해결**: 글쓰기 페이지와 동일한 `mounted` + `token` 가드 패턴을 그대로 적용. 비로그인이면 `/login?redirect=/stitchday/{id}/edit`로 이동시켜서, 로그인 후 다시 이 수정 페이지로 돌아오게 함.
- **기존 `isOwner` 체크와의 관계**: 이 가드는 "로그인 자체를 안 했는지"를 막는 것이고, 원래 있던 `isOwner` 체크(불러온 게시글의 `user_id`와 로그인한 `userId` 비교)는 "로그인은 했지만 본인 글이 아닌지"를 막는 것 — 목적이 달라서 둘 다 필요함. 실제 최종 차단은 어느 쪽이든 백엔드의 403이 책임짐(프론트 체크는 UX용 방어선).

---

## 회원가입 실패 토스트

- **문제**: 로그인 페이지는 실패 시 하단 토스트로 실제 에러 메시지를 보여주는데, 회원가입 최종 제출(`POST /auth/signup`)이 실패하면 `console.error`만 찍고 화면엔 아무 피드백이 없었음.
- **해결**: 로그인 페이지와 동일한 토스트 UI(하단 고정, 2.6초 후 자동 소멸) + 타이머 패턴을 회원가입 페이지에도 그대로 적용, `getApiErrorMessage`로 백엔드가 보낸 실제 실패 사유를 노출.

---

## 배포 준비 (Docker / GitHub Actions)

- **api 빌드가 원래 깨져 있던 이유**: `tsconfig.json`의 `module: "nodenext"`는 상대경로 import에 `.js` 확장자를 강제하는데(컴파일 결과물 기준 확장자), 실제 코드는 확장자 없이 작성돼 있었음. 개발 중엔 `tsx`가 이걸 알아서 처리해줘서 안 드러났지만, `tsc`로 진짜 빌드하면 에러남 — 모든 상대경로 import에 `.js`를 붙여서 해결(`../lib/db` → `../lib/db.js`). `@types/pg`, `@types/jsonwebtoken`도 없어서 추가 설치.
- **`outDir` 미설정 문제**: `tsconfig.json`에 `rootDir`/`outDir`이 주석 처리돼 있어서 빌드 결과물이 `dist/`가 아니라 `src/` 안에 소스랑 섞여서 생성되고 있었음. 두 값을 채워서 `dist/`로 정리되게 고침.
- **`npm run build`(`tsc`)까지 통과 + `node dist/server.js` 실행까지 확인 완료** — 이게 안 되면 Docker 이미지 자체가 안 만들어짐.
- **모노레포 Dockerfile 구조**: npm workspaces(`apps/*`)라서 Dockerfile의 빌드 컨텍스트는 항상 저장소 루트. api/web 두 워크스페이스의 `package.json`만 먼저 복사해서 `npm ci`로 의존성을 설치(레이어 캐시에도 유리, web 소스 전체는 필요 없음) → 그 다음 해당 앱 소스만 복사해서 빌드하는 멀티스테이지 구조.
- **web은 `output: "standalone"`로 전환**: Next.js 기본 빌드는 실행할 때 전체 `node_modules`가 필요한데, `standalone` 옵션을 켜면 실행에 필요한 최소 의존성만 추려서 `.next/standalone`에 담아줌 — 무료 티어처럼 메모리가 작은 서버에서 이미지 크기/실행 부담을 줄이기 위함. 모노레포라 `outputFileTracingRoot`도 저장소 루트로 명시해야 경로가 꼬이지 않음. (주의: 이 부분은 내 작업 환경에서 arm64/네트워크 제약으로 직접 `next build` 실행 검증을 못 했음 — 로컬이나 CI에서 한 번 확인 필요.)
- **빌드는 GitHub Actions, VM은 실행만**: `docker-compose.yml`(로컬용, 그 자리에서 빌드)과 별도로 `docker-compose.prod.yml`(배포용, GHCR에서 완성된 이미지를 받아서 실행만)을 분리. 이유: 무료 VM(RAM 1GB)에서 Next.js를 직접 빌드하면 메모리 부족으로 죽을 위험이 큼 — 리소스 넉넉한 GitHub Actions 서버에서 빌드/푸시하고, VM은 `docker compose pull && up -d`만 하도록 역할을 나눔.
- **`.github/workflows/deploy.yml`**: main에 push되면 ① api/web 이미지를 빌드해서 GHCR(GitHub Container Registry)에 올리고 ② VM에 SSH로 접속해서 최신 이미지를 받아 재기동. 필요한 GitHub Secrets/서버측 `.env` 목록은 워크플로 파일 맨 아래 주석에 정리해둠 — GCP 콘솔 설정 끝난 뒤 값 채워 넣으면 됨.
