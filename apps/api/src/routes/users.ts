////////////// 사용자(마이페이지) 관련 API
import { Router } from "express";
import { query } from "../lib/db";
import { auth } from "../middleware/jwtAuth";
const router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: 내 정보 조회
 *     description: 로그인한 사용자 본인의 정보를 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 내 정보 조회 성공
 *       401:
 *         description: 인증이 필요합니다.
 *       404:
 *         description: 사용자를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 */
////////////// 내 정보 조회
router.get("/me", auth, async (req, res) => {
  try {
    // 1. JWT에서 userId 꺼내기
    const userId = req.user!.userId;

    // 2. users 테이블에서 조회 (비밀번호는 절대 포함하지 않음)
    const result = await query(
      "SELECT id, email, nickname, created_at FROM users WHERE id = $1",
      [userId],
    );

    // 3. 사용자 없으면 404
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 4. 내 정보 반환
    return res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

export default router;
