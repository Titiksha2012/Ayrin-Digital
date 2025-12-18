const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadDb() {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    return { quizzes: [], results: [] };
  }
  const raw = fs.readFileSync(DB_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return {
      quizzes: Array.isArray(parsed.quizzes) ? parsed.quizzes : [],
      results: Array.isArray(parsed.results) ? parsed.results : [],
    };
  } catch {
    return { quizzes: [], results: [] };
  }
}

function saveDb(db) {
  ensureDataDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function updateDb(mutator) {
  const db = loadDb();
  const next = mutator(db) || db;
  saveDb(next);
  return next;
}

module.exports = { loadDb, saveDb, updateDb, DB_PATH };


