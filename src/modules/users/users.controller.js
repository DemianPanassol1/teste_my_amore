const usersService = require("./users.service");
const { sendSuccess } = require("../../utils/http");

function list(req, res) {
  return sendSuccess(res, usersService.listUsers(req.user.id, req.query.search));
}

function show(req, res) {
  return sendSuccess(res, usersService.getPublicUser(req.params.id));
}

function updateMe(req, res, next) {
  try {
    return sendSuccess(res, usersService.updateMe(req.user.id, req.body));
  } catch (error) {
    return next(error);
  }
}

function profile(req, res) {
  return sendSuccess(res, usersService.getMyProfile(req.user.id));
}

module.exports = {
  list,
  show,
  updateMe,
  profile,
};
