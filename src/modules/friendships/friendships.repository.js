const db = require("../../database/connection");
const { mapUser } = require("../users/users.repository");

function mapFriendship(row) {
  if (!row) return null;

  return {
    id: row.id,
    requesterId: row.requester_id,
    addresseeId: row.addressee_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function create(requesterId, addresseeId) {
  const result = db
    .prepare(`
      INSERT INTO friendships (requester_id, addressee_id)
      VALUES (?, ?)
    `)
    .run(requesterId, addresseeId);

  return findById(result.lastInsertRowid);
}

function findById(id) {
  const row = db.prepare("SELECT * FROM friendships WHERE id = ?").get(id);
  return mapFriendship(row);
}

function findBetween(userAId, userBId) {
  const row = db
    .prepare(`
      SELECT *
      FROM friendships
      WHERE (requester_id = ? AND addressee_id = ?)
         OR (requester_id = ? AND addressee_id = ?)
    `)
    .get(userAId, userBId, userBId, userAId);

  return mapFriendship(row);
}

function updateStatus(id, status) {
  db.prepare(`
    UPDATE friendships
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, id);

  return findById(id);
}

function areFriends(userAId, userBId) {
  const friendship = findBetween(userAId, userBId);
  return Boolean(friendship && friendship.status === "accepted");
}

function listReceivedPending(userId) {
  const rows = db
    .prepare(`
      SELECT f.*, u.id AS user_id, u.name, u.email, u.created_at AS user_created_at, u.updated_at AS user_updated_at
      FROM friendships f
      JOIN users u ON u.id = f.requester_id
      WHERE f.addressee_id = ? AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `)
    .all(userId);

  return rows.map((row) => ({
    ...mapFriendship(row),
    requester: mapUser({
      id: row.user_id,
      name: row.name,
      email: row.email,
      created_at: row.user_created_at,
      updated_at: row.user_updated_at,
    }),
  }));
}

function listSentPending(userId) {
  const rows = db
    .prepare(`
      SELECT f.*, u.id AS user_id, u.name, u.email, u.created_at AS user_created_at, u.updated_at AS user_updated_at
      FROM friendships f
      JOIN users u ON u.id = f.addressee_id
      WHERE f.requester_id = ? AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `)
    .all(userId);

  return rows.map((row) => ({
    ...mapFriendship(row),
    addressee: mapUser({
      id: row.user_id,
      name: row.name,
      email: row.email,
      created_at: row.user_created_at,
      updated_at: row.user_updated_at,
    }),
  }));
}

function listFriends(userId) {
  const rows = db
    .prepare(`
      SELECT
        u.*
      FROM friendships f
      JOIN users u
        ON u.id = CASE
          WHEN f.requester_id = ? THEN f.addressee_id
          ELSE f.requester_id
        END
      WHERE (f.requester_id = ? OR f.addressee_id = ?)
        AND f.status = 'accepted'
      ORDER BY u.name ASC
    `)
    .all(userId, userId, userId);

  return rows.map(mapUser);
}

module.exports = {
  create,
  findById,
  findBetween,
  updateStatus,
  areFriends,
  listReceivedPending,
  listSentPending,
  listFriends,
  mapFriendship,
};
