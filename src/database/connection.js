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
