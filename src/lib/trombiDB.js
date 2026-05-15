// Base de données SQLite (via sql.js / WebAssembly) — équivalent navigateur de H2 embarqué.
// La base est persistée dans localStorage (sérialisée en base64).
import initSqlJs from "sql.js";

const STORAGE_KEY = "trombinoscope_sqlite";

/**
 * Génère un UUID compatible avec tous les environnements
 * @returns {string} UUID v4
 */
const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback pour les environnements sans crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

let SQL = null;
let db = null;
let initPromise = null;

const toBase64 = (bytes) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

const fromBase64 = (b64) => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const persist = () => {
  if (!db) return;
  const data = db.export();
  localStorage.setItem(STORAGE_KEY, toBase64(data));
};

const initDB = async () => {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (!SQL) {
      SQL = await initSqlJs({ locateFile: () => "/wasm/sql-wasm.wasm" });
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    db = saved ? new SQL.Database(fromBase64(saved)) : new SQL.Database();

    db.run(`
      CREATE TABLE IF NOT EXISTS people (
        id TEXT PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        role TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        bio TEXT,
        photo TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_people_lastName ON people(lastName);
    `);
    return db;
  })();

  return initPromise;
};

const rowToPerson = (row) => ({
  id: row.id,
  firstName: row.firstName,
  lastName: row.lastName,
  role: row.role,
  email: row.email,
  phone: row.phone ?? undefined,
  bio: row.bio ?? undefined,
  photo: row.photo ?? undefined,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const queryAll = (sql, params = []) => {
  if (!db) return [];
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const out = [];
  while (stmt.step()) out.push(rowToPerson(stmt.getAsObject()));
  stmt.free();
  return out;
};

export const trombiDB = {
  async list() {
    await initDB();
    return queryAll("SELECT * FROM people ORDER BY lastName COLLATE NOCASE ASC");
  },

  async get(id) {
    await initDB();
    return queryAll("SELECT * FROM people WHERE id = ?", [id])[0];
  },

  async create(data) {
    await initDB();
    const now = Date.now();
    const person = {
      ...data,
      id: generateUUID(),
      createdAt: now,
      updatedAt: now,
    };
    db.run(
      `INSERT INTO people (id, firstName, lastName, role, email, phone, bio, photo, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        person.id,
        person.firstName,
        person.lastName,
        person.role,
        person.email,
        person.phone ?? null,
        person.bio ?? null,
        person.photo ?? null,
        person.createdAt,
        person.updatedAt,
      ],
    );
    persist();
    return person;
  },

  async update(id, data) {
    await initDB();
    const existing = await this.get(id);
    if (!existing) throw new Error("Person not found");
    const updated = { ...existing, ...data, updatedAt: Date.now() };
    db.run(
      `UPDATE people SET firstName=?, lastName=?, role=?, email=?, phone=?, bio=?, photo=?, updatedAt=?
       WHERE id=?`,
      [
        updated.firstName,
        updated.lastName,
        updated.role,
        updated.email,
        updated.phone ?? null,
        updated.bio ?? null,
        updated.photo ?? null,
        updated.updatedAt,
        id,
      ],
    );
    persist();
    return updated;
  },

  async remove(id) {
    await initDB();
    db.run("DELETE FROM people WHERE id = ?", [id]);
    persist();
  },

  /** Exporte la base SQLite brute (fichier .sqlite téléchargeable). */
  async exportRaw() {
    const database = await initDB();
    return database.export();
  },
};
