const path = require("node:path");
const sqlite3 = require("sqlite3").verbose();
const file = path.join(__dirname, "../db/todo.db");
const db = new sqlite3.Database(file);

module.exports = db;
