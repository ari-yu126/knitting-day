////////////// 로그인/회원가입 관련 API
import { Router } from "express";
import { query } from "../lib/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { transporter } from "../lib/mailer.js";

const router = Router();

/**
 * @swagger
 * /auth/check-email:
 *   get:
 *     tags:
 *       - Auth
 *     summary: 이메일 가입여부 조회
 *     description: 이메일을 조회 하여 가입여부를 확인 합니다.
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         required: true
 *         description: 조회할 이메일
 *     responses:
 *       200:
 *         description: 이메일 조회, 가입여부 확인
 *       400:
 *         description: 이메일이 입력되지 않았을 경우
 *       500:
 *         description: 서버 오류
 */
////////////// check email
router.get("/check-email", async (req, res) => {
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

/**
 * @swagger
 * /auth/send-code:
 *   post:
 *     tags:
 *       - Auth
 *     summary: 이메일 인증번호 발송
 *     description: 인증번호를 생성해 이메일 인증을 진행합니다.
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *                description: 인증번호를 발송할 이메일
 *     responses:
 *       200:
 *         description: 인증번호 발송 완료
 *       400:
 *         description: 이메일이 입력되지 않았거나, 이미 사용중인 이메일의 경우
 *       500:
 *         description: 서버 오류
 */
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
    await transporter.sendMail({
      from: process.env.EMAIL_USER!,
      to: email,
      subject: "뜨개한 날 인증번호",
      text: `뜨개한 날 이메일 인증번호: ${code}`,
    });

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

/**
 * @swagger
 * /auth/verify-code:
 *   post:
 *     tags:
 *       - Auth
 *     summary: 이메일 인증번호 검증
 *     description: 회원가입 진행 시 인증번호를 검증합니다.
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - verification_code
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *                description: 인증번호를 검증할 이메일
 *              verification_code:
 *                type: string
 *                description: 인증번호
 *     responses:
 *       200:
 *         description: 인증 완료
 *       400:
 *         description: 인증번호 만료 되었거나 인증번호 미 일치
 *       500:
 *         description: 서버 오류
 */
////////////// verity code
router.post("/verify-code", async (req, res) => {
  // 이메일, 코드 받기
  const email = req.body.email;
  const code = req.body.verification_code;

  try {
    // 필수값 확인
    if (!email || !code) {
      return res
        .status(400)
        .json({ message: "모든 필수 항목을 입력해주세요." });
    }

    // 테이블에서 조회
    const result = await query(
      "SELECT id, expires_at FROM email_verifications WHERE email = $1 AND verification_code = $2 AND verified_at IS NULL",
      [email, code],
    );

    // 인증번호 없음
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "인증번호가 일치하지 않습니다." });
    }

    // 만료시간(expires_at) 가져오기, 시간 비교
    const expires_at = result.rows[0].expires_at;
    if (new Date() > expires_at) {
      return res.status(400).json({ message: "인증번호가 만료되었습니다." });
    }

    // 성공하면 verified_at 업데이트
    await query(
      "UPDATE email_verifications SET verified_at = NOW() WHERE id = $1",
      [result.rows[0].id],
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }

  // verified_at true 반환
  return res.status(200).json({
    verified: true,
    message: "인증이 완료되었습니다.",
  });
});

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     tags:
 *       - Auth
 *     summary: 회원가입
 *     description: 인증번호를 검증하여 회원가입을 진행합니다.
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *              - nickname
 *              - agree_terms
 *              - agree_privacy
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *                description: 회원가입할 이메일
 *              password:
 *                type: string
 *                description: 회원가입할 비밀번호
 *              nickname:
 *                type: string
 *                description: 회원가입할 닉네임
 *              agree_terms:
 *                type: boolean
 *                description: 약관 동의 여부
 *              agree_privacy:
 *                type: boolean
 *                description: 개인정보 수집 동의 여부
 *              agree_marketing:
 *                type: boolean
 *                description: 마케팅 수신 동의 여부
 *     responses:
 *       200:
 *         description: 회원가입 완료
 *       400:
 *         description: 이메일 불일치, 인증받지 않은 이메일, 필수값 입력 안되었을 경우
 *       500:
 *         description: 서버 오류
 */
////////////// sign up
router.post("/signup", async (req, res) => {
  // 이메일, 비밀번호 받기
  const {
    email,
    password,
    nickname,
    agree_terms,
    agree_privacy,
    agree_marketing,
  } = req.body;

  try {
    // 필수값 확인
    if (!email || !password || !nickname || !agree_terms || !agree_privacy) {
      return res
        .status(400)
        .json({ message: "모든 필수 항목을 입력해주세요." });
    }

    // email_verifications 테이블 조회 (email)
    const result = await query(
      "SELECT email, verified_at FROM email_verifications WHERE email = $1 ORDER BY created_at DESC LIMIT 1",
      [email],
    );

    // 이메일 없으면 400
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "이메일이 일치하지 않습니다." });
    }

    // veritied_at 확인
    if (result.rows.length > 0 && result.rows[0].verified_at == null) {
      return res.status(400).json({ message: "인증되지 않은 이메일입니다." });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // users 테이블에 이메일, 비밀번호 저장
    await query(
      "INSERT INTO users (email, password, nickname, is_email_verified, agree_terms, agree_privacy, agree_marketing) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        email,
        hashedPassword,
        nickname,
        true,
        agree_terms,
        agree_privacy,
        agree_marketing,
      ],
    );

    // 200 회원가입 성공
    return res.status(200).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: 로그인
 *     description: 이메일과 비밀번호를 입력하여 로그인 합니다.
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *                description: 로그인할 이메일
 *              password:
 *                type: string
 *                description: 로그인할 비밀번호
 *     responses:
 *       200:
 *         description: 로그인 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                   description: 이후 요청의 Authorization 헤더에 실어 보낼 JWT
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     nickname:
 *                       type: string
 *       400:
 *         description: 이메일이나 비밀번호 불일치
 *       500:
 *         description: 서버 오류
 */
////////////// login
router.post("/login", async (req, res) => {
  // mail, password 받기
  const { email, password } = req.body;

  // mail이 users table에 있는지 찾기 "mail 주소를 확인해주세요"
  try {
    const result = await query(
      "SELECT id, email, password, nickname FROM users WHERE email = $1",
      [email],
    );

    // users에 있는 mail과 비교, password를 brcypt가 제공하는 방법으로 변환해서 일치하는지 확인
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "이메일이 일치하지 않습니다." });
    }

    // 일치하지 않으면 400 "비밀번호를 확인해주세요"
    const isMatch = await bcrypt.compare(password, result.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // 일치하면 - JWT 토큰 발급 payload, secret, options
    const token = jwt.sign(
      {
        userId: result.rows[0].id,
        email: result.rows[0].email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "3h",
      },
    );

    // 200 로그인 완료 - 응답에 포함해서 반환
    return res.status(200).json({
      message: "로그인이 완료 되었습니다",
      token,
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        nickname: result.rows[0].nickname,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

export default router;
