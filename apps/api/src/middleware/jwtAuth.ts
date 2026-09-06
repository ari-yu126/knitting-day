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
    req.user = tokenData;
    next();
  } catch (error) {
    return res.status(401).json({ message: "토큰 검증 실패" });
  }
};
