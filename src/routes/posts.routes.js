const { Router } = require("express");
const postsController = require("../modules/posts/posts.controller");
const commentsController = require("../modules/comments/comments.controller");
const {
  createPostSchema,
  updatePostSchema,
  deletePostSchema,
  listUserPostsSchema,
} = require("../modules/posts/posts.schemas");
const { createCommentSchema } = require("../modules/comments/comments.schemas");
const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createPostSchema), postsController.create);
router.get("/feed", postsController.feed);
router.get("/user/:userId", validate(listUserPostsSchema), postsController.listByUser);
router.put("/:id", validate(updatePostSchema), postsController.update);
router.delete("/:id", validate(deletePostSchema), postsController.remove);
router.post("/:postId/comments", validate(createCommentSchema), commentsController.create);

module.exports = router;
