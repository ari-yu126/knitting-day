import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

////////////// 로그인 여부 확인
export const auth = (req: Request, res: Response, next: NextFunction) => {
  // header에서 token 가져오기
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "로그인." });
  }

  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "로그인 정보가 없습니다." });
  }

  // 토큰 검증 token, secret
  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET!);
    // jwt.verify는 string | JwtPayload를 반환함. 로그인 시 항상 객체({ userId, email })로
    // 서명하므로 실제로 string이 나올 일은 없지만, 문자열 payload로 서명된 토큰이 들어오면
    // req.user(JwtPayload 타입)에 담을 수 없으니 방어적으로 걸러냄.
    if (typeof tokenData === "string") {
      return res.status(401).json({ message: "토큰 검증 실패" });
    }
    req.user = tokenData;
    next();
  } catch (error) {
    return res.status(401).json({ message: "토큰 검증 실패" });
  }
};
