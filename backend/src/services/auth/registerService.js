import bcrypt from "bcryptjs";
import { pool } from "../../db/db.js";

class RegisterService {
  async execute({ email, password, full_name }) {
    const hashed = await bcrypt.hash(password, 10);

    const userRes = await pool.query(
      `
      INSERT INTO users (email, password, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role
      `,
      [email, hashed, "engineer"]
    );

    const user = userRes.rows[0];

    await pool.query(
      `
      INSERT INTO user_profiles (user_id, full_name)
      VALUES ($1, $2)
      `,
      [user.id, full_name]
    );

    return user;
  }
}

export default new RegisterService();
