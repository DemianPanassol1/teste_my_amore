const db = require("../../database/connection");

function mapPost(row) {
  if (!row) return null;

  return {
    id: row.id,
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

function create(authorId, content) {
  const result = db
    .prepare(`
      INSERT INTO posts (author_id, content)
      VALUES (?, ?)
    `)
    .run(authorId, content);

  return findById(result.lastInsertRowid);
}

function findById(id) {
  const row = db
    .prepare(`
      SELECT
        p.*,
        u.name AS author_name,
        u.email AS author_email
      FROM posts p
      JOIN users u ON u.id = p.author_id
      WHERE p.id = ?
    `)
    .get(id);

  return mapPost(row);
}

function update(id, content) {
  db.prepare(`
    UPDATE posts
    SET content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(content, id);

  return findById(id);
}

function remove(id) {
  db.prepare("DELETE FROM posts WHERE id = ?").run(id);
}

function listFeed(userId) {
  const rows = db
    .prepare(`
      SELECT
        p.*,
        u.name AS author_name,
        u.email AS author_email
      FROM posts p
      JOIN users u ON u.id = p.author_id
      WHERE p.author_id = ?
         OR p.author_id IN (
          SELECT CASE
            WHEN requester_id = ? THEN addressee_id
            ELSE requester_id
          END
          FROM friendships
          WHERE (requester_id = ? OR addressee_id = ?)
            AND status = 'accepted'
         )
      ORDER BY p.created_at DESC, p.id DESC
    `)
    .all(userId, userId, userId, userId);

  return rows.map(mapPost);
}

function listByUser(userId) {
  const rows = db
    .prepare(`
      SELECT
        p.*,
        u.name AS author_name,
        u.email AS author_email
      FROM posts p
      JOIN users u ON u.id = p.author_id
      WHERE p.author_id = ?
      ORDER BY p.created_at DESC, p.id DESC
    `)
    .all(userId);

  return rows.map(mapPost);
}

module.exports = {
  create,
  findById,
  update,
  remove,
  listFeed,
  listByUser,
};
