import loginService from "../../services/auth/loginService.js";

class LoginController {
  async handle(req, res) {
    try {
      const result = await loginService.execute(req.body);

      res.json({
        message: "Login berhasil",
        ...result,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

export default new LoginController();
