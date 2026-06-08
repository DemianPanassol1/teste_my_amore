const jwt = require("jsonwebtoken");
const env = require("../config/env");
const AppError = require("../utils/AppError");
const usersRepository = require("../modules/users/users.repository");

function authMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Token nao informado.", 401, "UNAUTHORIZED"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = usersRepository.findById(payload.sub);

    if (!user) {
      return next(new AppError("Usuario autenticado nao encontrado.", 401, "UNAUTHORIZED"));
    }

    req.user = user;
    return next();
  } catch (_error) {
    return next(new AppError("Token invalido ou expirado.", 401, "UNAUTHORIZED"));
  }
}

module.exports = authMiddleware;
