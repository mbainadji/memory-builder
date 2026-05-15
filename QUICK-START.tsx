/**
 * DÉMARRAGE RAPIDE - CRUD ES6
 * Copiez/collez ces exemples pour commencer immédiatement
 */

import { crudService } from "@/lib/crud";
import {
  usePeople,
  useCreatePerson,
  useUpdatePerson,
  useDeletePerson,
  usePeopleSearch,
} from "@/lib/crud-hooks";

// ============================================================================
// 1️⃣ UTILISATION SIMPLE (Sans React Query)
// ============================================================================

// CRÉER
async function createExample() {
  const person = await crudService.create({
    firstName: "Alice",
    lastName: "Wonderland",
    role: "Developer",
    email: "alice@example.com",
  });
  console.log("Créée:", person.id);
}

// LIRE
async function readExample() {
  const all = await crudService.getAll();
  const one = await crudService.getById("person-id");
  console.log("Toutes:", all.length);
  console.log("Une:", one);
}

// METTRE À JOUR
async function updateExample() {
  const updated = await crudService.update("person-id", {
    firstName: "Alice2",
  });
  console.log("Mise à jour:", updated.firstName);
}

// SUPPRIMER
async function deleteExample() {
  await crudService.delete("person-id");
  console.log("Supprimée");
}

// ============================================================================
// 2️⃣ UTILISATION AVEC REACT QUERY (RECOMMANDÉ)
// ============================================================================

import { useState } from "react";

export function MyComponent() {
  // 📖 LECTURES
  const { data: people } = usePeople(); // Récupère toutes les personnes
  const { data: searchResults } = usePeopleSearch("Alice"); // Cherche "Alice"

  // ✏️ MUTATIONS
  const createMutation = useCreatePerson();
  const updateMutation = useUpdatePerson();
  const deleteMutation = useDeletePerson();

  // ➕ CRÉER
  const handleCreate = async () => {
    await createMutation.mutateAsync({
      firstName: "Bob",
      lastName: "Builder",
      role: "Designer",
      email: "bob@example.com",
    });
  };

  // 📝 METTRE À JOUR
  const handleUpdate = async (id: string) => {
    await updateMutation.mutateAsync({
      id,
      data: { firstName: "Bobby" },
    });
  };

  // 🗑️ SUPPRIMER
  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div>
      <p>{people?.length || 0} personnes</p>
      <button onClick={handleCreate} disabled={createMutation.isPending}>
        Créer
      </button>
      {people?.map((p) => (
        <div key={p.id}>
          {p.firstName} {p.lastName}
          <button onClick={() => handleUpdate(p.id)}>Modifier</button>
          <button onClick={() => handleDelete(p.id)}>Supprimer</button>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 3️⃣ OPÉRATIONS AVANCÉES
// ============================================================================

// RECHERCHE
async function searchExample() {
  const results = await crudService.search({
    search: "Alice", // dans firstName, lastName, email
    role: "Developer", // optionnel
  });
  console.log("Résultats:", results);
}

// PAGINATION
async function paginationExample() {
  const page = await crudService.getPaginated({ page: 1, limit: 10 }, { search: "" });
  console.log(`${page.items.length}/${page.total}`);
}

// UPSERT (créer ou mettre à jour)
async function upsertExample() {
  const person = await crudService.upsert(
    undefined, // ou un ID existant
    {
      firstName: "Charlie",
      lastName: "Brown",
      role: "Manager",
      email: "charlie@example.com",
    },
  );
  console.log("Upsert:", person.id);
}

// DUPLIQUER
async function duplicateExample() {
  const copy = await crudService.duplicate("person-id");
  console.log("Dupliquée:", copy.id);
}

// STATISTIQUES
async function statsExample() {
  const stats = await crudService.getStats();
  console.log("Total:", stats.total);
  console.log("Par rôle:", stats.byRole);
}

// EXPORT
async function exportExample() {
  const json = await crudService.exportJSON();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "people.json";
  a.click();
}

// IMPORT
async function importExample() {
  const jsonString = `[
    {
      "firstName": "David",
      "lastName": "Smith",
      "role": "Developer",
      "email": "david@example.com"
    }
  ]`;
  const count = await crudService.importJSON(jsonString);
  console.log(`${count} personne(s) importée(s)`);
}

// ============================================================================
// 4️⃣ GESTION D'ERREURS
// ============================================================================

async function errorHandling() {
  try {
    await crudService.create({
      firstName: "", // ❌ Erreur
      lastName: "Test",
      role: "Dev",
      email: "invalid", // ❌ Email invalide
    });
  } catch (error) {
    console.error("Validation échouée:", (error as Error).message);
  }
}

// ============================================================================
// 5️⃣ PATTERNS UTILES
// ============================================================================

// Pattern: Charger et rechercher
async function loadAndSearch(query: string) {
  if (!query) return crudService.getAll();
  return crudService.search({ search: query });
}

// Pattern: Batch create
async function batchCreate(data: Array<Record<string, unknown>>) {
  const results = [];
  for (const item of data) {
    try {
      const personData = {
        firstName: String(item.firstName || ""),
        lastName: String(item.lastName || ""),
        role: String(item.role || ""),
        email: String(item.email || ""),
        phone: item.phone ? String(item.phone) : undefined,
        bio: item.bio ? String(item.bio) : undefined,
        photo: item.photo ? String(item.photo) : undefined,
      };
      results.push(await crudService.create(personData));
    } catch (error) {
      console.error("Erreur:", error);
    }
  }
  return results;
}

// Pattern: Bulk delete
async function bulkDelete(ids: string[]) {
  const count = await crudService.deleteMultiple(ids);
  console.log(`${count}/${ids.length} supprimée(s)`);
  return count;
}

// ============================================================================
// 📚 DOCUMENTATION COMPLÈTE
// ============================================================================

/**
 * Voir CRUD-README.md pour la documentation complète
 * Voir crud-examples.ts pour plus d'exemples
 * Voir crud-tests.ts pour les tests unitaires
 * Voir crud-hooks.ts pour les hooks React Query
 */
