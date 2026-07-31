import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";

console.log("DATABASE_URL", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
