// 백엔드가 보내주는 타임스탬프(예: "2026-09-06T02:14:17.226Z")를
// 화면에 보여줄 "2026.09.06 11:14" 형태(24시간제)로 바꿔주는 함수
export function formatDate(value: string | null | undefined): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}
