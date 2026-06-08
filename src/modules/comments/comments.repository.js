const db = require("../../database/connection");

function mapComment(row) {
  if (!row) return null;

  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: row.author_name
      ? {
          id: row.author_id,
          name: row.author_name,
          email: row.author_email,
        }
      : undefined,
  };
}

function create(postId, authorId, content) {
  const result = db
    .prepare(`
      INSERT INTO comments (post_id, author_id, content)
      VALUES (?, ?, ?)
    `)
    .run(postId, authorId, content);

  return findById(result.lastInsertRowid);
}

function findById(id) {
  const row = db
    .prepare(`
      SELECT
        c.*,
        u.name AS author_name,
        u.email AS author_email
      FROM comments c
      JOIN users u ON u.id = c.author_id
      WHERE c.id = ?
    `)
    .get(id);

  return mapComment(row);
}

function remove(id) {
  db.prepare("DELETE FROM comments WHERE id = ?").run(id);
}

function listByPostIds(postIds) {
  if (!postIds.length) return {};

  const placeholders = postIds.map(() => "?").join(", ");
  const rows = db
    .prepare(`
      SELECT
        c.*,
        u.name AS author_name,
        u.email AS author_email
      FROM comments c
      JOIN users u ON u.id = c.author_id
      WHERE c.post_id IN (${placeholders})
      ORDER BY c.created_at ASC, c.id ASC
    `)
    .all(...postIds);

  return rows.reduce((acc, row) => {
    const comment = mapComment(row);
    acc[comment.postId] = acc[comment.postId] || [];
    acc[comment.postId].push(comment);
    return acc;
  }, {});
}

module.exports = {
  create,
  findById,
  remove,
  listByPostIds,
};
