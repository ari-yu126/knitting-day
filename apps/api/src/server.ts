import express from "express"; // 웹서버 구축을 위한 라이브러리
import cors from "cors"; // 프론트, 백엔드 다른 주소일때 접속 허용해줌
import { query } from "./lib/db"; // db.ts에서 만든 query 함수 가져오기
import authRouter from "./routes/auth"; // auth.ts에서 만든 authRouter 가져오기

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "knitting-day-api",
  });
});

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

app.use("/auth", authRouter);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
