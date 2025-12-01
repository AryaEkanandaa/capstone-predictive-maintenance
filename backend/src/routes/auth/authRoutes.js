import express from "express";
import RegisterController from "../../controllers/auth/registerController.js";
import LoginController from "../../controllers/auth/loginController.js";
import RefreshController from "../../controllers/auth/refreshController.js";

const router = express.Router();

router.post("/register", (req, res, next) => RegisterController.handle(req, res, next));
router.post("/login", (req, res, next) => LoginController.handle(req, res, next));
router.post("/refresh", (req, res, next) => RefreshController.refreshToken(req, res, next));

export default router;
