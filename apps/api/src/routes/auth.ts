////////////// 회원가입, 로그인 API
import { Router } from "express";
import { query } from "../lib/db";

const router = Router();

// check email
router.get("/check-email", async (req, res) => {
  console.log(req.query);
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ message: "이메일을 입력해주세요." });
  }

  try {
    const result = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      return res.status(200).json({ available: false });
    } else {
      return res.status(200).json({ available: true });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

////////////// send code
// 인증번호 생성
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
router.post("/send-code", async (req, res) => {
  // 이메일 받기
  const email = req.body.email;

  // 이메일 검증
  if (!email) {
    return res.status(400).json({ message: "이메일을 입력해주세요." });
  }

  try {
    // users 테이블 조회
    const result = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    // 이미 가입된 이메일인지 확인
    if (result.rows.length > 0) {
      return res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
    }

    // 인증번호 생성
    const code = generateCode();
    console.log(`인증번호(${email}): ${code}`);

    // 만료시간 설정
    const expiresAt = new Date(Date.now() + 1000 * 60 * 3);

    // email_verifications 테이블에 이메일, 인증번호, 만료시간 저장
    await query(
      "INSERT INTO email_verifications (email, verification_code, expires_at) VALUES ($1, $2, $3)",
      [email, code, expiresAt],
    );

    // 인증번호 매칭이 성공하면 메시지
    return res.status(200).json({ message: "인증번호를 발송했습니다." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

////////////// verity code
router.post("/verify-code", (req, res) => {
  console.log(req.body);
  res.json({ message: "TODO" });
});

////////////// sign up
router.post("/signup", (req, res) => {
  console.log(req.body);
  res.json({ message: "TODO" });
});

////////////// login
router.post("/login", (req, res) => {
  console.log(req.body);
  res.json({ message: "TODO" });
});

export default router;
