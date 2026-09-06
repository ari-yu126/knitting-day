////////////// 댓글 관련 API
import { Router } from "express";
import { query } from "../lib/db.js";
import { auth } from "../middleware/jwtAuth.js";
const router = Router();

/**
 * @swagger
 * /posts/{postId}/comments:
 *   get:
 *     tags:
 *       - Comments
 *     summary: 댓글 목록 조회
 *     description: 댓글 목록을 조회합니다.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: number
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 댓글 내용, 댓글 수 반환
 *       404:
 *         description: 게시글을 찾을 수 없는 경우
 *       500:
 *         description: 서버 오류
 */
////////////// 댓글 리스트
router.get("/posts/:postId/comments", async (req, res) => {
  try {
    // 1. 게시글 ID 받기
    const postId = req.params.postId;
    const postResult = await query("SELECT id FROM posts WHERE id = $1", [
      postId,
    ]);

    // 2. 게시글 ID가 있는지 확인
    // 게시글이 없으면 404
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    // 3. 해당 게시글의 ID와 일치하는 댓글을 DB에서 조회
    const commentsResult = await query(
      "SELECT comments.*, users.nickname FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = $1",
      [postId],
    );

    // 4. 댓글 반환
    return res.status(200).json({
      // 댓글 내용 반환
      comments: commentsResult.rows,
      // 댓글 수 반환
      comment_count: commentsResult.rows.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "댓글 조회 실패" });
  }
});

/**
 * @swagger
 * /posts/{postId}/comments:
 *   post:
 *     tags:
 *       - Comments
 *     summary: 댓글 작성
 *     description: 댓글을 작성합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: number
 *         description: 게시글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 댓글 내용
 *     responses:
 *       201:
 *         description: 댓글 등록 완료
 *       400:
 *         description: 댓글 내용이 없는 경우
 *       401:
 *         description: 인증이 필요한 경우
 *       404:
 *         description: 게시글을 찾을 수 없는 경우
 *       500:
 *         description: 서버 오류
 */
////////////// 댓글 작성
router.post("/posts/:postId/comments", auth, async (req, res) => {
  try {
    // 1. 로그인 미들웨어 확인
    const userId = req.user!.userId;

    // 2. 게시글 ID받기
    const postId = req.params.postId;

    // 3. 게시글 ID가 있는지 확인
    const postResult = await query("SELECT id FROM posts WHERE id = $1", [
      postId,
    ]);
    // 게시글이 없으면 404
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    // 4. 댓글 내용 req.body에서 가져와서, 비었으면 400
    const commentContent = req.body.content;
    if (!commentContent) {
      return res.status(400).json({ message: "댓글 내용을 입력해주세요." });
    }

    // 5. 댓글 내용 DB에 저장
    await query(
      "INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3)",
      [postId, userId, commentContent],
    );

    // 6. posts.comment_count 증가
    await query(
      "UPDATE posts SET comment_count = comment_count + 1, updated_at = NOW() WHERE id = $1",
      [postId],
    );

    // 7. 댓글 저장 등록 완료
    return res.status(201).json({ message: "댓글이 등록되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "댓글 작성 실패" });
  }
});

/**
 * @swagger
 * /comments/{commentId}:
 *   put:
 *     tags:
 *       - Comments
 *     summary: 댓글 수정
 *     description: 로그인한 사용자가 본인이 작성한 댓글을 수정합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: number
 *         description: 수정할 댓글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 댓글 내용
 *     responses:
 *       200:
 *         description: 댓글 수정 완료
 *       400:
 *         description: 댓글 내용이 없는 경우
 *       401:
 *         description: 인증이 필요한 경우
 *       403:
 *         description: 본인 댓글이 아닌 경우
 *       404:
 *         description: 댓글을 찾을 수 없는 경우
 *       500:
 *         description: 서버 오류
 */
////////////// 댓글 수정
router.put("/comments/:commentId", auth, async (req, res) => {
  try {
    // 1. 로그인 미들웨어 실행
    const userId = req.user!.userId;

    // 2. 댓글 ID 받기
    const commentId = req.params.commentId;

    // 3. 댓글 ID에 해당하는 댓글 조회
    const commentResult = await query(
      "SELECT user_id from comments WHERE id = $1",
      [commentId],
    );
    // 댓글이 없으면 404
    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }

    // 4. 댓글 작성자와 현재 로그인한 사용자 비교, 본인 댓글이 아니면 403
    if (Number(userId) !== Number(commentResult.rows[0].user_id)) {
      return res.status(403).json({ message: "본인 댓글이 아닙니다." });
    }

    // 5. 수정할 댓글 내용 받기
    // 필수 내용 없으면 400
    const commentContent = req.body.content;
    if (!commentContent) {
      return res.status(400).json({ message: "댓글 내용을 입력해주세요." });
    }

    // 6. 댓글 내용 DB에 저장
    await query(
      "UPDATE comments SET updated_at = NOW(), content = $1 WHERE id = $2",
      [commentContent, commentId],
    );

    // 7. 댓글 수정 등록 완료
    return res.status(200).json({ message: "댓글이 수정되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "댓글 수정 실패" });
  }
});

/**
 * @swagger
 * /comments/{commentId}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: 댓글 삭제
 *     description: 로그인한 사용자가 본인이 작성한 댓글을 삭제합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: number
 *         description: 삭제할 댓글 ID
 *     responses:
 *       200:
 *         description: 댓글 삭제 완료
 *       401:
 *         description: 인증이 필요한 경우
 *       403:
 *         description: 본인 댓글이 아닌 경우
 *       404:
 *         description: 댓글을 찾을 수 없는 경우
 *       500:
 *         description: 서버 오류
 */
////////////// 댓글 삭제
router.delete("/comments/:commentId", auth, async (req, res) => {
  try {
    // 1. 로그인 미들웨어 실행
    const userId = req.user!.userId;

    // 2. 댓글 ID 받기
    const commentId = req.params.commentId;

    // 3. 댓글 ID에 해당하는 댓글 조회
    const commentResult = await query(
      "SELECT user_id, post_id FROM comments WHERE id = $1",
      [commentId],
    );
    // 댓글이 없으면 404
    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }

    // 4. 댓글 작성자와 현재 로그인한 사용자 비교, 본인 댓글이 아니면 403
    if (Number(userId) !== Number(commentResult.rows[0].user_id)) {
      return res.status(403).json({ message: "본인 댓글이 아닙니다." });
    }

    const postId = commentResult.rows[0].post_id;

    // 5. 댓글 삭제
    await query("DELETE FROM comments WHERE id = $1", [commentId]);

    // 6. posts.comment_count 감소 (0 미만 방지)
    await query(
      "UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0), updated_at = NOW() WHERE id = $1",
      [postId],
    );

    // 7. 댓글 삭제 등록 완료
    return res.status(200).json({ message: "댓글이 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "댓글 삭제 실패" });
  }
});

export default router;
