import jwt from "jsonwebtoken";
import { pool } from "../../db/db.js";
import { generateAccessToken } from "../../utils/tokenGenerator.js";

class RefreshService {
  async execute(refreshToken) {
    const stored = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token = $1`,
      [refreshToken]
    );

    if (stored.rowCount === 0) {
      throw new Error("Refresh token tidak valid");
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = generateAccessToken({ id: decoded.id });

    return { accessToken: newAccessToken };
  }
}

export default new RefreshService();
