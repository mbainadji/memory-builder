import { openDB, type DBSchema, type IDBPDatabase } from "idb";

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

interface TrombiSchema extends DBSchema {
  people: {
    key: string;
    value: Person;
    indexes: { "by-lastName": string };
  };
}

let dbPromise: Promise<IDBPDatabase<TrombiSchema>> | null = null;

const getDB = () => {
  if (typeof window === "undefined") throw new Error("IndexedDB unavailable on server");
  if (!dbPromise) {
    dbPromise = openDB<TrombiSchema>("trombinoscope", 1, {
      upgrade(db) {
        const store = db.createObjectStore("people", { keyPath: "id" });
        store.createIndex("by-lastName", "lastName");
      },
    });
  }
  return dbPromise;
};

export const trombiDB = {
  async list(): Promise<Person[]> {
    const db = await getDB();
    return db.getAll("people");
  },
  async get(id: string) {
    const db = await getDB();
    return db.get("people", id);
  },
  async create(data: Omit<Person, "id" | "createdAt" | "updatedAt">) {
    const db = await getDB();
    const now = Date.now();
    const person: Person = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    await db.put("people", person);
    return person;
  },
  async update(id: string, data: Partial<Omit<Person, "id" | "createdAt">>) {
    const db = await getDB();
    const existing = await db.get("people", id);
    if (!existing) throw new Error("Person not found");
    const updated: Person = { ...existing, ...data, updatedAt: Date.now() };
    await db.put("people", updated);
    return updated;
  },
  async remove(id: string) {
    const db = await getDB();
    await db.delete("people", id);
  },
};
