const { Router } = require("express");
const usersController = require("../modules/users/users.controller");
const {
  listUsersSchema,
  showUserSchema,
  updateMeSchema,
} = require("../modules/users/users.schemas");
const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.use(authMiddleware);

router.get("/", validate(listUsersSchema), usersController.list);
router.put("/me", validate(updateMeSchema), usersController.updateMe);
router.get("/me/profile", usersController.profile);
router.get("/:id", validate(showUserSchema), usersController.show);

module.exports = router;
