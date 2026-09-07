////////////// 게시글 관련 API
import { Router } from "express";
import { query } from "../lib/db.js";
import { auth } from "../middleware/jwtAuth.js";
const router = Router();

/**
 * @swagger
 * /posts:
 *   get:
 *     tags:
 *       - Posts
 *     summary: 게시글 목록 조회
 *     description: 게시글 목록을 페이징하여 조회합니다.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 조회할 페이지 번호
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: 특정 사용자가 작성한 게시글만 조회할 때 사용 (예 - 마이페이지 "내가 쓴 글")
 *     responses:
 *       200:
 *         description: 게시글 목록 조회 성공
 *       500:
 *         description: 서버 오류
 */
////////////// 게시글 리스트
router.get("/", async (req, res) => {
  try {
    // 1. 페이지 번호 받기 (url)
    const page = req.query.page || 1;

    // 2. 한 페이지당 보여줄 개수
    const limit = 10;

    // 3. 특정 작성자 글만 조회할지 여부 (마이페이지 "내가 쓴 글")
    const userId = req.query.userId;

    const offset = (Number(page) - 1) * limit;

    let totalCountResult;
    let posts;

    if (userId) {
      // 4-1. 특정 사용자가 쓴 글만 조회
      const totalCount = await query(
        "SELECT COUNT(*) FROM posts WHERE user_id = $1",
        [userId],
      );
      totalCountResult = totalCount.rows[0].count;

      posts = await query(
        "SELECT posts.*, users.nickname FROM posts JOIN users ON posts.user_id = users.id WHERE posts.user_id = $1 ORDER BY posts.created_at DESC LIMIT $2 OFFSET $3",
        [userId, limit, offset],
      );
    } else {
      // 4-2. 전체 게시글 조회
      const totalCount = await query("SELECT COUNT(*) FROM posts");
      totalCountResult = totalCount.rows[0].count;

      posts = await query(
        "SELECT posts.*, users.nickname FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC LIMIT $1 OFFSET $2",
        [limit, offset],
      );
    }

    // 5. 페이징 계산
    const totalPages = Math.ceil(totalCountResult / limit);

    return res.status(200).json({
      posts: posts.rows,
      currentPage: Number(page),
      totalPages,
      totalCount: totalCountResult,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * @swagger
 * /posts:
 *   post:
 *     tags:
 *       - Posts
 *     summary: 게시글 작성
 *     description: 로그인한 사용자가 게시글을 작성합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - category
 *               - tags
 *             properties:
 *               title:
 *                 type: string
 *                 description: 게시글 제목
 *               content:
 *                 type: string
 *                 description: 게시글 내용
 *               category:
 *                 type: string
 *                 description: 게시글 카테고리
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 게시글 태그
 *     responses:
 *       201:
 *         description: 게시글 작성 성공
 *       400:
 *         description: 필수 내용이 없거나, 내용이 비어있습니다.
 *       401:
 *         description: 인증이 필요한 경우
 *       500:
 *         description: 서버 오류
 */
////////////// 게시글 작성
router.post("/", auth, async (req, res) => {
  // 1. 로그인 여부 확인 : JWT 인증 미들웨어 실행, 로그인 되어 있으면 req.user에서 사용자 정보 확인
  const userId = req.user!.userId;

  try {
    // 2. 게시글 내용 받기
    // title, content 등을 req.body에서 받기
    const { title, content, category, tags } = req.body;

    // 3. 게시글 내용 확인
    // 필수 내용 없으면 400
    if (!title || !content || !category || !tags) {
      return res.status(400).json({ message: "내용을 입력해주세요." });
    }

    // 4. DB에 게시글 저장
    // req.user의 userId와 게시글 내용을 DB에 저장
    await query(
      "INSERT INTO posts (user_id, category, title, content, tags) VALUES ($1, $2, $3, $4, $5)",
      [userId, category, title, content, tags],
    );

    // 게시글 등록 성공
    return res.status(201).json({ message: "게시물이 등록되었습니다." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * @swagger
 * /posts/{postId}:
 *   put:
 *     tags:
 *       - Posts
 *     summary: 게시글 수정
 *     description: 로그인한 사용자가 본인이 작성한 게시글을 수정합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 게시글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - category
 *               - tags
 *             properties:
 *               title:
 *                 type: string
 *                 description: 게시글 제목
 *               content:
 *                 type: string
 *                 description: 게시글 내용
 *               category:
 *                 type: string
 *                 description: 게시글 카테고리
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 게시글 태그
 *     responses:
 *       200:
 *         description: 게시글 수정 성공
 *       400:
 *         description: 필수 내용이 없습니다.
 *       401:
 *         description: 인증이 필요합니다.
 *       403:
 *         description: 본인이 작성한 게시글이 아닙니다.
 *       404:
 *         description: 게시글을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 */
////////////// 게시글 수정
router.put("/:postId", auth, async (req, res) => {
  // 1. JWT 인증 미들웨어 실행
  const postId = req.params.postId;
  try {
    // 2. 게시글 ID 받기
    const postResult = await query("SELECT user_id FROM posts WHERE id = $1", [
      postId,
    ]);
    // 게시글이 없으면 404
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    // 3. 수정할 게시글 내용 받기
    const { title, content, category, tags } = req.body;
    // 필수 내용 없으면 400
    if (!title || !content || !category || !tags) {
      return res.status(400).json({ message: "내용을 입력해주세요." });
    }

    // 4. postId에 해당하는 게시글의 작성자 조회
    const postUserId = postResult.rows[0].user_id;

    // 5. 게시글 작성자와 현재 로그인한 사용자 비교
    // 본인 글이 아니면 403 반환
    if (postUserId !== req.user!.userId) {
      return res.status(403).json({ message: "본인 글이 아닙니다." });
    }

    // 6. 게시글 수정
    await query(
      "UPDATE posts SET updated_at = NOW(),title = $1, content = $2, category = $3, tags = $4 WHERE id = $5",
      [title, content, category, tags, postId],
    );
    // 수정 성공
    return res.status(200).json({ message: "게시글이 수정되었습니다." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * @swagger
 * /posts/{postId}:
 *   delete:
 *     tags:
 *       - Posts
 *     summary: 게시글 삭제
 *     description: 로그인한 사용자가 본인이 작성한 게시글을 삭제 합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         required: true
 *         name: postId
 *         schema:
 *           type: integer
 *         description: 삭제할 게시글 ID
 *     responses:
 *       200:
 *         description: 게시글 삭제 성공
 *       401:
 *         description: 인증이 필요합니다.
 *       403:
 *         description: 본인이 작성한 게시글이 아닙니다.
 *       404:
 *         description: 게시글을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 */
////////////// 게시글 삭제
router.delete("/:postId", auth, async (req, res) => {
  // 1. JWT 인증 미들웨어 실행
  const postId = req.params.postId;
  try {
    // 2. 게시글 ID 받기
    const postResult = await query("SELECT user_id FROM posts WHERE id = $1", [
      postId,
    ]);
    // 게시글이 없으면 404
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    // 3. postID에 해당하는 게시글의 작성자 조회
    const postUserId = postResult.rows[0].user_id;

    // 4. 게시글 작성자와 현재 로그인한 사용자 비교
    // 본인 글이 아니면 403 반환
    if (postUserId !== req.user!.userId) {
      return res.status(403).json({ message: "본인 글이 아닙니다." });
    }

    // 5. 게시글 삭제
    await query("DELETE FROM posts WHERE id = $1", [postId]);
    // 삭제 성공
    return res.status(200).json({ message: "게시글이 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * @swagger
 * /posts/{postId}/like:
 *   post:
 *     tags:
 *       - Posts
 *     summary: 게시글 좋아요
 *     description: 게시글의 좋아요 수를 1 증가시킵니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         required: true
 *         name: postId
 *         schema:
 *           type: integer
 *         description: 좋아요할 게시글 ID
 *     responses:
 *       200:
 *         description: 좋아요 성공
 *       401:
 *         description: 인증이 필요합니다.
 *       404:
 *         description: 게시글을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 */
////////////// 게시글 좋아요 (+1)
router.post("/:postId/like", auth, async (req, res) => {
  const postId = req.params.postId;
  try {
    const result = await query(
      "UPDATE posts SET like_count = like_count + 1 WHERE id = $1 RETURNING like_count",
      [postId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }
    return res.status(200).json({ likeCount: result.rows[0].like_count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * @swagger
 * /posts/{postId}/like:
 *   delete:
 *     tags:
 *       - Posts
 *     summary: 게시글 좋아요 취소
 *     description: 게시글의 좋아요 수를 1 감소시킵니다 (0 미만으로 내려가지 않습니다).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         required: true
 *         name: postId
 *         schema:
 *           type: integer
 *         description: 좋아요를 취소할 게시글 ID
 *     responses:
 *       200:
 *         description: 좋아요 취소 성공
 *       401:
 *         description: 인증이 필요합니다.
 *       404:
 *         description: 게시글을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 */
////////////// 게시글 좋아요 취소 (-1)
router.delete("/:postId/like", auth, async (req, res) => {
  const postId = req.params.postId;
  try {
    const result = await query(
      "UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1 RETURNING like_count",
      [postId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }
    return res.status(200).json({ likeCount: result.rows[0].like_count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * @swagger
 * /posts/{postId}:
 *   get:
 *     tags:
 *       - Posts
 *     summary: 게시글 상세 조회
 *     description: 게시글을 조회 합니다.
 *     parameters:
 *       - in: path
 *         required: true
 *         name: postId
 *         schema:
 *           type: integer
 *         description: 조회할 게시글 ID
 *     responses:
 *       200:
 *         description: 게시글 상세 조회 성공
 *       400:
 *         description: 게시글 id가 올바르지 않습니다.
 *       404:
 *         description: 게시글을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 */
////////////// 게시글 상세 조회
router.get("/:postId", async (req, res) => {
  try {
    // 1. 게시글 id 받기
    const postId = req.params.postId;

    // 2. 게시글 id 파라미터가 숫자 형식인지 확인
    if (Number.isNaN(Number(postId))) {
      return res
        .status(400)
        .json({ message: "게시글 id가 올바르지 않습니다." });
    }

    // 3. DB조회
    const postResult = await query(
      "SELECT posts.*, users.nickname FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = $1",
      [postId],
    );
    // 게시글 없으면 404
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    const post = postResult.rows[0];

    // Adjacent posts by created_at (not id ± 1 — IDs can have gaps).
    // 비교 기준 시각을 (post.created_at처럼) JS Date로 한 번 꺼냈다가 다시 파라미터로 넣으면
    // Postgres의 마이크로초 정밀도가 JS Date의 밀리초 정밀도로 잘려서, 자기 자신의 created_at이
    // "자기보다 크다"고 잘못 판정되는 버그가 있었음 (실제로 2개 글로 테스트하니 다음글에 항상
    // 자기 자신이 나오는 문제로 나타남). 서브쿼리로 DB 안에서만 비교해서 정밀도 손실을 없애고,
    // id != $1로 한 번 더 자기 자신을 걸러냄.
    const prevResult = await query(
      `SELECT id, title FROM posts
       WHERE created_at < (SELECT created_at FROM posts WHERE id = $1)
         AND id != $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [postId],
    );
    const nextResult = await query(
      `SELECT id, title FROM posts
       WHERE created_at > (SELECT created_at FROM posts WHERE id = $1)
         AND id != $1
       ORDER BY created_at ASC
       LIMIT 1`,
      [postId],
    );

    // 4. 게시글 반환
    return res.status(200).json({
      post,
      prevPost: prevResult.rows[0] ?? null,
      nextPost: nextResult.rows[0] ?? null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

export default router;
