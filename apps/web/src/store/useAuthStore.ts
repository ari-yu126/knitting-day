import { create } from "zustand";

interface AuthState {
  token: string | null;
  email: string | null;
  nickname: string | null;
  userId: number | null;
  setToken: (token: string | null) => void;
  setEmail: (email: string | null) => void;
  setNickname: (nickname: string | null) => void;
  setUserId: (userId: number | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token:
    typeof window !== "undefined"
      ? localStorage.getItem("token") || null
      : null,
  email:
    typeof window !== "undefined"
      ? localStorage.getItem("email") || null
      : null,
  nickname:
    typeof window !== "undefined"
      ? localStorage.getItem("nickname") || null
      : null,
  userId:
    typeof window !== "undefined"
      ? Number(localStorage.getItem("userId")) || null
      : null,

  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    set({ token });
  },
  setEmail: (email) => {
    if (email) {
      localStorage.setItem("email", email);
    } else {
      localStorage.removeItem("email");
    }
    set({ email });
  },
  setNickname: (nickname) => {
    if (nickname) {
      localStorage.setItem("nickname", nickname);
    } else {
      localStorage.removeItem("nickname");
    }
    set({ nickname });
  },
  setUserId: (userId) => {
    if (userId != null) {
      localStorage.setItem("userId", String(userId));
    } else {
      localStorage.removeItem("userId");
    }
    set({ userId });
  },
  logout: () => {
    set({ token: null, email: null, nickname: null, userId: null });
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("nickname");
    localStorage.removeItem("userId");
  },
}));
