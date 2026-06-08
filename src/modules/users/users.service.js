const AppError = require("../../utils/AppError");
const friendshipsRepository = require("../friendships/friendships.repository");
const usersRepository = require("./users.repository");

function listUsers(currentUserId, search) {
  return usersRepository.listExcept(currentUserId, search).map((user) => ({
    ...user,
    mutualFriendsCount: friendshipsRepository.countMutualFriends(currentUserId, user.id),
  }));
}

function getPublicUser(id) {
  const user = usersRepository.findById(id);

  if (!user) {
    throw new AppError("Usuario nao encontrado.", 404, "NOT_FOUND");
  }

  return user;
}

function updateMe(currentUserId, data) {
  if (data.email) {
    const existingUser = usersRepository.findByEmail(data.email);

    if (existingUser && existingUser.id !== currentUserId) {
      throw new AppError("Email ja cadastrado.", 409, "EMAIL_ALREADY_EXISTS");
    }
  }

  return usersRepository.update(currentUserId, data);
}

function getMyProfile(currentUserId) {
  const user = usersRepository.findById(currentUserId);

  if (!user) {
    throw new AppError("Usuario nao encontrado.", 404, "NOT_FOUND");
  }

  return {
    user,
    stats: usersRepository.countProfileStats(currentUserId),
  };
}

module.exports = {
  listUsers,
  getPublicUser,
  updateMe,
  getMyProfile,
};
