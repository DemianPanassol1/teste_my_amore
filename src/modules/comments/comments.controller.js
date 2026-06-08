const commentsService = require("./comments.service");
const { sendSuccess } = require("../../utils/http");

function create(req, res, next) {
  try {
    return sendSuccess(
      res,
      commentsService.createComment(req.params.postId, req.user.id, req.body.content),
      201
    );
  } catch (error) {
    return next(error);
  }
}

function remove(req, res, next) {
  try {
    return sendSuccess(res, commentsService.deleteComment(req.params.id, req.user.id));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  remove,
};
