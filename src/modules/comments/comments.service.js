const AppError = require("../../utils/AppError");
const friendshipsRepository = require("../friendships/friendships.repository");
const postsRepository = require("../posts/posts.repository");
const commentsRepository = require("./comments.repository");

function canInteractWithPost(userId, post) {
  return post.authorId === userId || friendshipsRepository.areFriends(userId, post.authorId);
}

function createComment(postId, authorId, content) {
  const post = postsRepository.findById(postId);

  if (!post) {
    throw new AppError("Post nao encontrado.", 404, "NOT_FOUND");
  }

  if (!canInteractWithPost(authorId, post)) {
    throw new AppError("Voce so pode comentar em posts proprios ou de amigos.", 403, "FORBIDDEN");
  }

  return commentsRepository.create(postId, authorId, content);
}

function deleteComment(commentId, authorId) {
  const comment = commentsRepository.findById(commentId);

  if (!comment) {
    throw new AppError("Comentario nao encontrado.", 404, "NOT_FOUND");
  }

  if (comment.authorId !== authorId) {
    throw new AppError("Apenas o autor pode excluir este comentario.", 403, "FORBIDDEN");
  }

  commentsRepository.remove(commentId);
  return { deleted: true };
}

module.exports = {
  createComment,
  deleteComment,
};
