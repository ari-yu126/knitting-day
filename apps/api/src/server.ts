import express from "express"; // 웹서버 구축을 위한 라이브러리
import cors from "cors"; // 프론트, 백엔드 다른 주소일때 접속 허용해줌
import swaggerUi from "swagger-ui-express"; // swagger 문서 표시를 위한 라이브러리
import { swaggerSpec } from "./swagger.js"; // swagger 문서 표시를 위한 라이브러리
import { query } from "./lib/db.js"; // db.ts에서 만든 query 함수 가져오기
import authRouter from "./routes/auth.js"; // auth.ts에서 만든 authRouter 가져오기
import postRouter from "./routes/posts.js"; // auth.ts에서 만든 authRouter 가져오기
import commentsRouter from "./routes/comments.js"; // auth.ts에서 만든 authRouter 가져오기
import usersRouter from "./routes/users.js"; // users.ts에서 만든 usersRouter 가져오기

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

/**
 * @swagger
 * /health:
 *   get:
 *     tags:
 *       - System
 *     summary: 서버 상태 확인
 *     description: API 서버가 살아있는지 확인합니다 (DB는 확인 안 함).
 *     responses:
 *       200:
 *         description: 서버 정상
 */
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "knitting-day-api",
  });
});

/**
 * @swagger
 * /db-test:
 *   get:
 *     tags:
 *       - System
 *     summary: DB 연결 확인
 *     description: PostgreSQL에 실제로 접속해서 현재 시각을 조회합니다.
 *     responses:
 *       200:
 *         description: DB 연결 정상
 *       500:
 *         description: DB 연결 실패
 */
app.get("/db-test", async (_req, res) => {
  try {
    const result = await query("SELECT NOW()");
    res.json({
      status: "success",
      time: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRouter);
app.use("/posts", postRouter);
app.use(commentsRouter);
app.use("/users", usersRouter);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
