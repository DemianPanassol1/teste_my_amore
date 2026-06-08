const AppError = require("../utils/AppError");

function notFound(req, _res, next) {
  return next(new AppError(`Rota ${req.method} ${req.originalUrl} nao encontrada.`, 404, "NOT_FOUND"));
}

module.exports = notFound;
