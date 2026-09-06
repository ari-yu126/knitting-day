import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 공통 401 처리
// 토큰이 없거나(비로그인) 만료/위조된 토큰이면 서버는 항상 401을 내려준다(jwtAuth 미들웨어 참고).
// 이 응답 인터셉터가 401을 감지하면 zustand 스토어를 한 번에 로그아웃 상태로 초기화한다.
// 로그인이 필요한 페이지들(mypage, write, edit 등)은 이미 store의 token을 구독해서
// "토큰 없으면 /login으로" 가드를 걸어두고 있기 때문에, 토큰이 비워지는 순간
// 해당 페이지가 알아서 로그인 페이지로 리다이렉트된다. (여기서 직접 router.push를 하지 않는 이유:
// 이 파일은 axios 인스턴스라서 React 컴포넌트 트리 밖이고, 이미 각 페이지에 있는 가드를 재사용하는 게 더 단순함)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(
  error: unknown,
  fallback = "요청 처리 중 오류가 발생했어요.",
) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return fallback;
}