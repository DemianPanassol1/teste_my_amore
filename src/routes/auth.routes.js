const { Router } = require("express");
const authController = require("../modules/auth/auth.controller");
const { registerSchema, loginSchema } = require("../modules/auth/auth.schemas");
const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authMiddleware, authController.me);

module.exports = router;
