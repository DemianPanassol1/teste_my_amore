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

function remove(id) {
  db.prepare("DELETE FROM friendships WHERE id = ?").run(id);
}

function areFriends(userAId, userBId) {
  const friendship = findBetween(userAId, userBId);
  return Boolean(friendship && friendship.status === "accepted");
}

function countMutualFriends(userAId, userBId) {
  const row = db
    .prepare(`
      WITH friends_a AS (
        SELECT CASE
          WHEN requester_id = ? THEN addressee_id
          ELSE requester_id
        END AS friend_id
        FROM friendships
        WHERE (requester_id = ? OR addressee_id = ?)
          AND status = 'accepted'
      ),
      friends_b AS (
        SELECT CASE
          WHEN requester_id = ? THEN addressee_id
          ELSE requester_id
        END AS friend_id
        FROM friendships
        WHERE (requester_id = ? OR addressee_id = ?)
          AND status = 'accepted'
      )
      SELECT COUNT(*) AS count
      FROM friends_a
      JOIN friends_b ON friends_a.friend_id = friends_b.friend_id
      WHERE friends_a.friend_id <> ?
        AND friends_a.friend_id <> ?
    `)
    .get(userAId, userAId, userAId, userBId, userBId, userBId, userAId, userBId);

  return row.count;
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
    mutualFriendsCount: countMutualFriends(userId, row.user_id),
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
    mutualFriendsCount: countMutualFriends(userId, row.user_id),
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

  return rows.map((row) => ({
    ...mapUser(row),
    mutualFriendsCount: countMutualFriends(userId, row.id),
  }));
}

module.exports = {
  create,
  findById,
  findBetween,
  updateStatus,
  remove,
  areFriends,
  countMutualFriends,
  listReceivedPending,
  listSentPending,
  listFriends,
  mapFriendship,
};
