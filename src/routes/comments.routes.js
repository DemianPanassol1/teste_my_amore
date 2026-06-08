const { Router } = require("express");
const commentsController = require("../modules/comments/comments.controller");
const { deleteCommentSchema } = require("../modules/comments/comments.schemas");
const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.use(authMiddleware);

router.delete("/:id", validate(deleteCommentSchema), commentsController.remove);

module.exports = router;
