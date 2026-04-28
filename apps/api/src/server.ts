import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./lib/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "stitch-flow-api",
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

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});