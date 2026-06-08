const usersService = require("./users.service");
const { sendSuccess } = require("../../utils/http");

function list(req, res) {
  return sendSuccess(res, usersService.listUsers(req.user.id));
}

function show(req, res) {
  return sendSuccess(res, usersService.getPublicUser(req.params.id));
}

module.exports = {
  list,
  show,
};
