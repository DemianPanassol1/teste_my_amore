const authService = require("./auth.service");
const { sendSuccess } = require("../../utils/http");

async function register(req, res, next) {
  try {
    return sendSuccess(res, await authService.register(req.body), 201);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    return sendSuccess(res, await authService.login(req.body));
  } catch (error) {
    return next(error);
  }
}

function me(req, res) {
  return sendSuccess(res, authService.me(req.user));
}

module.exports = {
  register,
  login,
  me,
};
