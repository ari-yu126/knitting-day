// 백엔드가 보내주는 타임스탬프(예: "2026-09-06T02:14:17.226Z", UTC 기준)를
// 화면에 보여줄 "2026.09.06 11:14" 형태(24시간제, 한국시간)로 바꿔주는 함수
export function formatDate(value: string | null | undefined): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  // getFullYear()/getHours() 같은 로컬 타임존 getter를 쓰면, 이 함수가 브라우저가 아니라
  // 서버(Next.js 서버 컴포넌트)에서 실행될 때 문제가 됨 — 배포용 Docker 컨테이너는 보통
  // 시스템 타임존이 UTC라서, 한국시간이 아니라 UTC 시간이 찍혀버림(예: 오후 2시 글이 05시로 표시).
  // 그래서 어디서 실행되든 항상 한국시간(UTC+9)으로 보이게, UTC 값에 9시간을 직접 더한 뒤
  // UTC getter로 꺼내는 방식으로 계산함.
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);

  const year = kst.getUTCFullYear();
  const month = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kst.getUTCDate()).padStart(2, "0");
  const hours = String(kst.getUTCHours()).padStart(2, "0");
  const minutes = String(kst.getUTCMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}
