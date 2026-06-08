const AppError = require("../../utils/AppError");
const usersRepository = require("../users/users.repository");
const friendshipsRepository = require("./friendships.repository");

function requestFriendship(requesterId, addresseeId) {
  if (requesterId === addresseeId) {
    throw new AppError("Voce nao pode enviar solicitacao para si mesmo.", 400, "VALIDATION_ERROR");
  }

  const addressee = usersRepository.findById(addresseeId);

  if (!addressee) {
    throw new AppError("Usuario de destino nao encontrado.", 404, "NOT_FOUND");
  }

  const existingFriendship = friendshipsRepository.findBetween(requesterId, addresseeId);

  if (existingFriendship) {
    const message =
      existingFriendship.status === "accepted"
        ? "Usuarios ja sao amigos."
        : "Ja existe uma solicitacao entre estes usuarios.";

    throw new AppError(message, 409, "FRIENDSHIP_ALREADY_EXISTS");
  }

  return friendshipsRepository.create(requesterId, addresseeId);
}

function listReceivedRequests(userId) {
  return friendshipsRepository.listReceivedPending(userId);
}

function listSentRequests(userId) {
  return friendshipsRepository.listSentPending(userId);
}

function listFriends(userId) {
  return friendshipsRepository.listFriends(userId);
}

function answerFriendship(friendshipId, userId, status) {
  const friendship = friendshipsRepository.findById(friendshipId);

  if (!friendship) {
    throw new AppError("Solicitacao de amizade nao encontrada.", 404, "NOT_FOUND");
  }

  if (friendship.addresseeId !== userId) {
    throw new AppError("Apenas o destinatario pode responder a solicitacao.", 403, "FORBIDDEN");
  }

  if (friendship.status !== "pending") {
    throw new AppError("Esta solicitacao ja foi respondida.", 409, "FRIENDSHIP_ALREADY_ANSWERED");
  }

  return friendshipsRepository.updateStatus(friendshipId, status);
}

function removeFriendship(friendshipId, userId) {
  const friendship = friendshipsRepository.findById(friendshipId);

  if (!friendship) {
    throw new AppError("Amizade nao encontrada.", 404, "NOT_FOUND");
  }

  const userIsInFriendship =
    friendship.requesterId === userId || friendship.addresseeId === userId;

  if (!userIsInFriendship) {
    throw new AppError("Voce nao faz parte desta amizade.", 403, "FORBIDDEN");
  }

  if (friendship.status !== "accepted") {
    throw new AppError("So e possivel remover amizades aceitas.", 409, "FRIENDSHIP_NOT_ACCEPTED");
  }

  friendshipsRepository.remove(friendshipId);
  return { deleted: true };
}

module.exports = {
  requestFriendship,
  listReceivedRequests,
  listSentRequests,
  listFriends,
  answerFriendship,
  removeFriendship,
};
