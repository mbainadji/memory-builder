// Base de données SQLite (via sql.js / WebAssembly) — équivalent navigateur de H2 embarqué.
// La base est persistée dans localStorage (sérialisée en base64).
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phone?: string;
  bio?: string;
  photo?: string; // dataURL
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "trombinoscope_sqlite";

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let initPromise: Promise<Database> | null = null;

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

const fromBase64 = (b64: string) => {
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

const initDB = async (): Promise<Database> => {
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

const rowToPerson = (row: Record<string, unknown>): Person => ({
  id: row.id as string,
  firstName: row.firstName as string,
  lastName: row.lastName as string,
  role: row.role as string,
  email: row.email as string,
  phone: (row.phone as string) ?? undefined,
  bio: (row.bio as string) ?? undefined,
  photo: (row.photo as string) ?? undefined,
  createdAt: row.createdAt as number,
  updatedAt: row.updatedAt as number,
});

const queryAll = (sql: string, params: unknown[] = []): Person[] => {
  if (!db) return [];
  const stmt = db.prepare(sql);
  stmt.bind(params as never);
  const out: Person[] = [];
  while (stmt.step()) out.push(rowToPerson(stmt.getAsObject()));
  stmt.free();
  return out;
};

export const trombiDB = {
  async list(): Promise<Person[]> {
    await initDB();
    return queryAll("SELECT * FROM people ORDER BY lastName COLLATE NOCASE ASC");
  },

  async get(id: string): Promise<Person | undefined> {
    await initDB();
    return queryAll("SELECT * FROM people WHERE id = ?", [id])[0];
  },

  async create(data: Omit<Person, "id" | "createdAt" | "updatedAt">): Promise<Person> {
    await initDB();
    const now = Date.now();
    const person: Person = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    db!.run(
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

  async update(id: string, data: Partial<Omit<Person, "id" | "createdAt">>): Promise<Person> {
    await initDB();
    const existing = await this.get(id);
    if (!existing) throw new Error("Person not found");
    const updated: Person = { ...existing, ...data, updatedAt: Date.now() };
    db!.run(
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

  async remove(id: string): Promise<void> {
    await initDB();
    db!.run("DELETE FROM people WHERE id = ?", [id]);
    persist();
  },

  /** Exporte la base SQLite brute (fichier .sqlite téléchargeable). */
  async exportRaw(): Promise<Uint8Array> {
    const database = await initDB();
    return database.export();
  },
};
