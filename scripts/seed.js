const bcrypt = require("bcryptjs");
const db = require("../src/database/connection");

(async () => {
  await db.initializeDatabase();

  const passwordHash = bcrypt.hashSync("123456", 10);

  db.exec(`
    DELETE FROM comments;
    DELETE FROM posts;
    DELETE FROM friendships;
    DELETE FROM users;
    DELETE FROM sqlite_sequence WHERE name IN ('comments', 'posts', 'friendships', 'users');
  `);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash)
    VALUES (?, ?, ?)
  `);

  const ana = insertUser.run("Ana Souza", "ana@example.com", passwordHash).lastInsertRowid;
  const bruno = insertUser.run("Bruno Lima", "bruno@example.com", passwordHash).lastInsertRowid;
  insertUser.run("Carla Dias", "carla@example.com", passwordHash);

  db.prepare(`
    INSERT INTO friendships (requester_id, addressee_id, status)
    VALUES (?, ?, 'accepted')
  `).run(ana, bruno);

  const postId = db.prepare(`
    INSERT INTO posts (author_id, content)
    VALUES (?, ?)
  `).run(ana, "Ola! Este e um post de exemplo.").lastInsertRowid;

  db.prepare(`
    INSERT INTO comments (post_id, author_id, content)
    VALUES (?, ?, ?)
  `).run(postId, bruno, "Comentario de exemplo de um amigo.");

  console.log("Seed concluido.");
  console.log("Usuarios criados com senha: 123456");
  console.log("- ana@example.com");
  console.log("- bruno@example.com");
  console.log("- carla@example.com");
})();
