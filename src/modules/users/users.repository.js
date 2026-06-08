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

function listExcept(currentUserId) {
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
      ORDER BY u.name ASC
    `)
    .all(currentUserId, currentUserId, currentUserId);

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

module.exports = {
  create,
  findByEmail,
  findById,
  findByIdWithPassword,
  listExcept,
  mapUser,
};
