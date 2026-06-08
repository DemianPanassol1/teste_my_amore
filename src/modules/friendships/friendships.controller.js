const friendshipsService = require("./friendships.service");
const { sendSuccess } = require("../../utils/http");

function request(req, res, next) {
  try {
    return sendSuccess(
      res,
      friendshipsService.requestFriendship(req.user.id, req.params.userId),
      201
    );
  } catch (error) {
    return next(error);
  }
}

function received(req, res) {
  return sendSuccess(res, friendshipsService.listReceivedRequests(req.user.id));
}

function sent(req, res) {
  return sendSuccess(res, friendshipsService.listSentRequests(req.user.id));
}

function accept(req, res, next) {
  try {
    return sendSuccess(res, friendshipsService.answerFriendship(req.params.id, req.user.id, "accepted"));
  } catch (error) {
    return next(error);
  }
}

function reject(req, res, next) {
  try {
    return sendSuccess(res, friendshipsService.answerFriendship(req.params.id, req.user.id, "rejected"));
  } catch (error) {
    return next(error);
  }
}

function friends(req, res) {
  return sendSuccess(res, friendshipsService.listFriends(req.user.id));
}

module.exports = {
  request,
  received,
  sent,
  accept,
  reject,
  friends,
};
