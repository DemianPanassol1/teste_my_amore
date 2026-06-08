const AppError = require("../../utils/AppError");
const usersRepository = require("../users/users.repository");
const friendshipsRepository = require("../friendships/friendships.repository");
const commentsRepository = require("../comments/comments.repository");
const postsRepository = require("./posts.repository");

function attachComments(posts) {
  const postIds = posts.map((post) => post.id);
  const commentsByPostId = commentsRepository.listByPostIds(postIds);

  return posts.map((post) => ({
    ...post,
    comments: commentsByPostId[post.id] || [],
  }));
}

function createPost(authorId, content) {
  return postsRepository.create(authorId, content);
}

function getFeed(userId) {
  return attachComments(postsRepository.listFeed(userId));
}

function listUserPosts(currentUserId, targetUserId) {
  const targetUser = usersRepository.findById(targetUserId);

  if (!targetUser) {
    throw new AppError("Usuario nao encontrado.", 404, "NOT_FOUND");
  }

  if (currentUserId !== targetUserId && !friendshipsRepository.areFriends(currentUserId, targetUserId)) {
    throw new AppError("Voce so pode ver posts de amigos.", 403, "FORBIDDEN");
  }

  return attachComments(postsRepository.listByUser(targetUserId));
}

function updatePost(postId, authorId, content) {
  const post = postsRepository.findById(postId);

  if (!post) {
    throw new AppError("Post nao encontrado.", 404, "NOT_FOUND");
  }

  if (post.authorId !== authorId) {
    throw new AppError("Apenas o autor pode atualizar este post.", 403, "FORBIDDEN");
  }

  return postsRepository.update(postId, content);
}

function deletePost(postId, authorId) {
  const post = postsRepository.findById(postId);

  if (!post) {
    throw new AppError("Post nao encontrado.", 404, "NOT_FOUND");
  }

  if (post.authorId !== authorId) {
    throw new AppError("Apenas o autor pode excluir este post.", 403, "FORBIDDEN");
  }

  postsRepository.remove(postId);
  return { deleted: true };
}

module.exports = {
  createPost,
  getFeed,
  listUserPosts,
  updatePost,
  deletePost,
};
