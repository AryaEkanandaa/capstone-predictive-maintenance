import bcrypt from "bcryptjs";
import { pool } from "../../db/db.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/tokenGenerator.js";

class LoginService {
  async execute({ email, password }) {
    const userRes = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (userRes.rowCount === 0) {
      throw new Error("Email tidak ditemukan");
    }

    const user = userRes.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) throw new Error("Password salah");

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({ id: user.id });

    await pool.query(
      `
      INSERT INTO refresh_tokens (user_id, token)
      VALUES ($1, $2)
      `,
      [user.id, refreshToken]
    );

    return { accessToken, refreshToken, user };
  }
}

export default new LoginService();
