const { Router } = require("express");
const usersController = require("../modules/users/users.controller");
const { showUserSchema } = require("../modules/users/users.schemas");
const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.use(authMiddleware);

router.get("/", usersController.list);
router.get("/:id", validate(showUserSchema), usersController.show);

module.exports = router;
