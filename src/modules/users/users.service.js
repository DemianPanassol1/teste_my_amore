const AppError = require("../../utils/AppError");
const usersRepository = require("./users.repository");

function listUsers(currentUserId) {
  return usersRepository.listExcept(currentUserId);
}

function getPublicUser(id) {
  const user = usersRepository.findById(id);

  if (!user) {
    throw new AppError("Usuario nao encontrado.", 404, "NOT_FOUND");
  }

  return user;
}

module.exports = {
  listUsers,
  getPublicUser,
};
