// PostgreSQL 연결 + 여행 계획 테이블

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;

export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS travel_plans (
      id UUID PRIMARY KEY,
      destination TEXT NOT NULL,
      area_code TEXT NOT NULL,
      sigungu_code TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      adults INT DEFAULT 2,
      children INT DEFAULT 0,
      styles TEXT[] DEFAULT '{}',
      center_lat DOUBLE PRECISION,
      center_lng DOUBLE PRECISION,
      ai_recommendation TEXT,
      data JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_travel_plans_created
      ON travel_plans (created_at DESC);
  `);
}
