// API Backend pour la synchronisation
// À placer dans src/api/sync.ts

import type { Person } from "../lib/trombiDB";

// Stockage en mémoire pour cette démo (remplacer par une vraie BD)
let serverDatabase: Map<string, Person> = new Map();

// En production, utiliser une BD réelle (D1 avec Cloudflare, PostgreSQL, etc.)
export async function handleSync(clientData: Person[]): Promise<Person[]> {
  // 1. Mettre à jour le serveur avec les données du client
  for (const person of clientData) {
    const existing = serverDatabase.get(person.id);

    if (!existing || person.updatedAt > existing.updatedAt) {
      serverDatabase.set(person.id, person);
    }
  }

  // 2. Retourner toutes les données du serveur
  return Array.from(serverDatabase.values());
}

// Pour Cloudflare Workers avec D1
export async function initializeWithD1(env: any) {
  // Exemple d'utilisation de Cloudflare D1
  // const db = env.DB; // Accès à la base D1
  // await db
  //   .prepare(
  //     `CREATE TABLE IF NOT EXISTS people (
  //     id TEXT PRIMARY KEY,
  //     firstName TEXT NOT NULL,
  //     lastName TEXT NOT NULL,
  //     role TEXT NOT NULL,
  //     email TEXT NOT NULL,
  //     phone TEXT,
  //     bio TEXT,
  //     photo TEXT,
  //     createdAt INTEGER NOT NULL,
  //     updatedAt INTEGER NOT NULL
  //   )`
  //   )
  //   .run();
}

// Mock data pour démo
export function loadMockData() {
  serverDatabase.set("mock-1", {
    id: "mock-1",
    firstName: "Alice",
    lastName: "Johnson",
    role: "Product Manager",
    email: "alice@company.com",
    phone: "+33 (0)1 12 34 56 78",
    bio: "Passionnée par les produits innovants",
    photo: "",
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  });

  serverDatabase.set("mock-2", {
    id: "mock-2",
    firstName: "Bob",
    lastName: "Smith",
    role: "Lead Developer",
    email: "bob@company.com",
    phone: "+33 (0)1 87 65 43 21",
    bio: "Expert en architecture logicielle",
    photo: "",
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  });
}
