const { Router } = require("express");
const friendshipsController = require("../modules/friendships/friendships.controller");
const {
  requestFriendshipSchema,
  friendshipActionSchema,
} = require("../modules/friendships/friendships.schemas");
const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.use(authMiddleware);

router.post("/request/:userId", validate(requestFriendshipSchema), friendshipsController.request);
router.get("/requests", friendshipsController.received);
router.get("/sent", friendshipsController.sent);
router.post("/:id/accept", validate(friendshipActionSchema), friendshipsController.accept);
router.post("/:id/reject", validate(friendshipActionSchema), friendshipsController.reject);
router.delete("/:id", validate(friendshipActionSchema), friendshipsController.remove);
router.get("/friends", friendshipsController.friends);

module.exports = router;
