import registerService from "../../services/auth/registerService.js";

class RegisterController {
  async handle(req, res) {
    try {
      const user = await registerService.execute(req.body);

      res.status(201).json({
        message: "Registrasi berhasil",
        user,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

export default new RegisterController();
