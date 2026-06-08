const { Router } = require("express");
const authRoutes = require("./auth.routes");
const usersRoutes = require("./users.routes");
const friendshipsRoutes = require("./friendships.routes");
const postsRoutes = require("./posts.routes");
const commentsRoutes = require("./comments.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/friendships", friendshipsRoutes);
router.use("/posts", postsRoutes);
router.use("/comments", commentsRoutes);

module.exports = router;
