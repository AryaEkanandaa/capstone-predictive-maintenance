import { pool } from "../../db/db.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/tokenGenerator.js";
import { hashToken } from "../../utils/hashToken.js";
import jwt from "jsonwebtoken";
import jwtConfig from "../../config/jwt.js";

class RefreshService {
  async execute(refreshToken) {
    if (!refreshToken) throw new Error("Refresh token diperlukan");

    // 🔥 verify dulu tokennya valid
    const data = jwt.verify(refreshToken, jwtConfig.refreshSecret);

    // 🔥 hash token yang dikirim user lalu cocokkan dengan DB
    const hashed = hashToken(refreshToken);

    const find = await pool.query(
      `SELECT * FROM refresh_tokens WHERE user_id=$1 AND token=$2`,
      [data.id, hashed]
    );

    if (!find.rowCount) throw new Error("Refresh token tidak cocok (expired/diakses dari device lain)");

    // 🔥 token rotation → generate refresh token baru
    const newRefresh = generateRefreshToken({ id: data.id });
    const newHash = hashToken(newRefresh);

    await pool.query(`DELETE FROM refresh_tokens WHERE user_id=$1`, [data.id]);
    await pool.query(`INSERT INTO refresh_tokens(user_id, token) VALUES ($1,$2)`, [data.id, newHash]);

    // 🔥 generate access baru
    const newAccess = generateAccessToken({ id: data.id });

    return {
      accessToken: newAccess,
      refreshToken: newRefresh, // kirim kembali rotating token
    };
  }
}

export default new RefreshService();
