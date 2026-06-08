const db = require("../../database/connection");

function mapUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapUserWithPassword(row) {
  if (!row) return null;

  return {
    ...mapUser(row),
    passwordHash: row.password_hash,
  };
}

function create({ name, email, passwordHash }) {
  const statement = db.prepare(`
    INSERT INTO users (name, email, password_hash)
    VALUES (?, ?, ?)
  `);

  const result = statement.run(name, email, passwordHash);
  return findById(result.lastInsertRowid);
}

function findByEmail(email) {
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  return mapUserWithPassword(row);
}

function findById(id) {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  return mapUser(row);
}

function findByIdWithPassword(id) {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  return mapUserWithPassword(row);
}

function update(id, data) {
  const fields = [];
  const params = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    params.push(data.name);
  }

  if (data.email !== undefined) {
    fields.push("email = ?");
    params.push(data.email);
  }

  if (!fields.length) return findById(id);

  db.prepare(`
    UPDATE users
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(...params, id);

  return findById(id);
}

function listExcept(currentUserId, search) {
  const params = [currentUserId, currentUserId, currentUserId];
  let searchClause = "";

  if (search) {
    searchClause = "AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)";
    const searchTerm = `%${search.toLowerCase()}%`;
    params.push(searchTerm, searchTerm);
  }

  const rows = db
    .prepare(`
      SELECT
        u.*,
        f.id AS friendship_id,
        f.status AS friendship_status,
        f.requester_id AS friendship_requester_id,
        f.addressee_id AS friendship_addressee_id
      FROM users u
      LEFT JOIN friendships f
        ON (
          (f.requester_id = ? AND f.addressee_id = u.id)
          OR (f.requester_id = u.id AND f.addressee_id = ?)
        )
      WHERE u.id <> ?
        ${searchClause}
      ORDER BY u.name ASC
    `)
    .all(...params);

  return rows.map((row) => ({
    ...mapUser(row),
    friendship: row.friendship_id
      ? {
          id: row.friendship_id,
          status: row.friendship_status,
          requesterId: row.friendship_requester_id,
          addresseeId: row.friendship_addressee_id,
        }
      : null,
  }));
}

function countProfileStats(userId) {
  const postsCount = db
    .prepare("SELECT COUNT(*) AS count FROM posts WHERE author_id = ?")
    .get(userId).count;

  const friendsCount = db
    .prepare(`
      SELECT COUNT(*) AS count
      FROM friendships
      WHERE (requester_id = ? OR addressee_id = ?)
        AND status = 'accepted'
    `)
    .get(userId, userId).count;

  const commentsCount = db
    .prepare("SELECT COUNT(*) AS count FROM comments WHERE author_id = ?")
    .get(userId).count;

  return {
    postsCount,
    friendsCount,
    commentsCount,
  };
}

module.exports = {
  create,
  findByEmail,
  findById,
  findByIdWithPassword,
  update,
  listExcept,
  countProfileStats,
  mapUser,
};
