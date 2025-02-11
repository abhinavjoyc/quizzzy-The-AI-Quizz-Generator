import { Pool } from 'pg';

// Initialize Neon database connection
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL, // Ensure this is set in .env.local
  ssl: { rejectUnauthorized: false }, // Required for NeonDB
});

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: "Method Not Allowed" });

  const { gameId } = req.query;
  console.log("Received gameId:", gameId); // Debugging

  if (!gameId) return res.status(400).json({ error: "Missing gameId parameter" });

  try {
    const result = await pool.query('SELECT * FROM games WHERE id = $1', [gameId]);

    console.log("Query result:", result.rows); // Debugging

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error", details: error.message });
  }
}
