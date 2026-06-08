const postsService = require("./posts.service");
const { sendSuccess } = require("../../utils/http");

function create(req, res, next) {
  try {
    return sendSuccess(res, postsService.createPost(req.user.id, req.body.content), 201);
  } catch (error) {
    return next(error);
  }
}

function feed(req, res) {
  return sendSuccess(res, postsService.getFeed(req.user.id));
}

function listByUser(req, res, next) {
  try {
    return sendSuccess(res, postsService.listUserPosts(req.user.id, req.params.userId));
  } catch (error) {
    return next(error);
  }
}

function update(req, res, next) {
  try {
    return sendSuccess(res, postsService.updatePost(req.params.id, req.user.id, req.body.content));
  } catch (error) {
    return next(error);
  }
}

function remove(req, res, next) {
  try {
    return sendSuccess(res, postsService.deletePost(req.params.id, req.user.id));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  feed,
  listByUser,
  update,
  remove,
};
