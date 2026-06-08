const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");

const databaseDir = path.resolve(process.cwd(), "database");
const databaseFile = path.join(databaseDir, "app.sqlite");
const schemaFile = path.join(databaseDir, "schema.sql");
let db;
let initialized = false;

if (!fs.existsSync(databaseDir)) {
  fs.mkdirSync(databaseDir, { recursive: true });
}

function persistDatabase() {
  if (!db) return;
  fs.writeFileSync(databaseFile, Buffer.from(db.export()));
}

function ensureDatabase() {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase() before using repositories.");
  }
}

function normalizeParams(params) {
  if (params.length === 0) return [];
  if (params.length === 1 && Array.isArray(params[0])) return params[0];
  if (params.length === 1 && typeof params[0] === "object" && params[0] !== null) return params[0];
  return params;
}

function mapEmptyRowToUndefined(row) {
  return row && Object.keys(row).length > 0 ? row : undefined;
}

function migratePostContentLimit() {
  const result = db.exec(`
    SELECT sql
    FROM sqlite_master
    WHERE type = 'table' AND name = 'posts'
  `);
  const createSql = result[0]?.values?.[0]?.[0] || "";

  if (!createSql.includes("1000")) return;

  db.exec(`
    PRAGMA foreign_keys = OFF;

    BEGIN TRANSACTION;

    CREATE TABLE posts_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id INTEGER NOT NULL,
      content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 500),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    INSERT INTO posts_new (id, author_id, content, created_at, updated_at)
    SELECT id, author_id, substr(content, 1, 500), created_at, updated_at
    FROM posts;

    DROP TABLE posts;
    ALTER TABLE posts_new RENAME TO posts;

    COMMIT;

    PRAGMA foreign_keys = ON;
  `);
}

async function initializeDatabase() {
  if (initialized) return;

  const SQL = await initSqlJs({
    locateFile: (file) => require.resolve(`sql.js/dist/${file}`),
  });

  if (fs.existsSync(databaseFile)) {
    db = new SQL.Database(fs.readFileSync(databaseFile));
  } else {
    db = new SQL.Database();
  }

  db.run("PRAGMA foreign_keys = ON;");

  if (fs.existsSync(schemaFile)) {
    db.exec(fs.readFileSync(schemaFile, "utf8"));
  }

  migratePostContentLimit();

  persistDatabase();
  initialized = true;
}

function exec(sql) {
  ensureDatabase();
  db.exec(sql);
  persistDatabase();
}

function prepare(sql) {
  ensureDatabase();

  return {
    get: (...params) => {
      const statement = db.prepare(sql);
      statement.bind(normalizeParams(params));

      const row = statement.step() ? statement.getAsObject() : undefined;
      statement.free();

      return mapEmptyRowToUndefined(row);
    },
    all: (...params) => {
      const statement = db.prepare(sql);
      statement.bind(normalizeParams(params));

      const rows = [];
      while (statement.step()) {
        rows.push(statement.getAsObject());
      }

      statement.free();
      return rows;
    },
    run: (...params) => {
      const statement = db.prepare(sql);
      statement.bind(normalizeParams(params));
      statement.step();
      statement.free();

      const changes = prepare("SELECT changes() AS changes").get().changes;
      const lastInsertRowid = prepare("SELECT last_insert_rowid() AS id").get().id;

      persistDatabase();

      return {
        changes,
        lastInsertRowid,
      };
    },
  };
}

module.exports = {
  initializeDatabase,
  exec,
  prepare,
};
