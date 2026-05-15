/**
 * EXEMPLES D'UTILISATION DU SERVICE CRUD ES6
 * Copiez/collez ces exemples pour commencer immédiatement
 */

import { crudService } from "./crud.js";
import {
  usePeople,
  useCreatePerson,
  useUpdatePerson,
  useDeletePerson,
  usePeopleSearch,
} from "./crud-hooks.js";

// ============================================================================
// 1️⃣ UTILISATION SIMPLE (Sans React Query)
// ============================================================================

export async function exempleCreate() {
  try {
    const newPerson = await crudService.create({
      firstName: "Jean",
      lastName: "Dupont",
      role: "Développeur",
      email: "jean.dupont@example.com",
      phone: "+33612345678",
      bio: "Expert fullstack",
      photo: "",
    });

    console.log("✅ Personne créée:", newPerson);
    return newPerson;
  } catch (error) {
    console.error("❌ Erreur lors de la création:", error);
  }
}

export async function exempleReadById(id) {
  try {
    const person = await crudService.getById(id);
    console.log("✅ Personne trouvée:", person);
    return person;
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

export async function exempleReadAll() {
  try {
    const allPeople = await crudService.getAll();
    console.log("✅ Toutes les personnes:", allPeople);
    return allPeople;
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

// ============================================================================
// 2️⃣ RECHERCHE ET FILTRAGE
// ============================================================================

export async function exempleSearch(query) {
  try {
    const results = await crudService.search({
      search: query,
    });
    console.log(`✅ Résultats pour "${query}":`, results);
    return results;
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

export async function exempleFilterByRole(role) {
  try {
    const results = await crudService.search({
      role: role,
    });
    console.log(`✅ Personnes avec le rôle "${role}":`, results);
    return results;
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

// ============================================================================
// 3️⃣ PAGINATION
// ============================================================================

export async function exemplePagination(page = 1, limit = 10) {
  try {
    const result = await crudService.getPaginated(
      { page, limit },
      { search: "" }
    );

    console.log("✅ Résultat paginé:", {
      items: result.items,
      page: result.page,
      total: result.total,
      totalPages: result.totalPages,
    });

    return result;
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

// ============================================================================
// 4️⃣ MISE À JOUR ET SUPPRESSION
// ============================================================================

export async function exempleUpdate(id) {
  try {
    const updated = await crudService.update(id, {
      firstName: "Jean-Marie",
      bio: "Expert fullstack JavaScript",
    });
    console.log("✅ Personne mise à jour:", updated);
    return updated;
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour:", error);
  }
}

export async function exempleDelete(id) {
  try {
    await crudService.delete(id);
    console.log("✅ Personne supprimée");
  } catch (error) {
    console.error("❌ Erreur lors de la suppression:", error);
  }
}

export async function exempleDeleteMultiple(ids) {
  try {
    const count = await crudService.deleteMultiple(ids);
    console.log(`✅ ${count} personne(s) supprimée(s)`);
    return count;
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

// ============================================================================
// 5️⃣ OPÉRATIONS AVANCÉES
// ============================================================================

export async function exempleUpsert(id, data) {
  try {
    const result = await crudService.upsert(id, data);
    console.log("✅ Personne créée ou mise à jour:", result);
    return result;
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

export async function exempleDuplicate(id) {
  try {
    const duplicate = await crudService.duplicate(id);
    console.log("✅ Personne dupliquée:", duplicate);
    return duplicate;
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

export async function exempleStats() {
  try {
    const stats = await crudService.getStats();
    console.log("✅ Statistiques:", {
      total: stats.total,
      byRole: stats.byRole,
      recentlyUpdated: stats.recentlyUpdated.map((p) => `${p.firstName} ${p.lastName}`),
    });
    return stats;
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

// ============================================================================
// 6️⃣ EXPORT/IMPORT
// ============================================================================

export async function exempleExport() {
  try {
    const json = await crudService.exportJSON();
    console.log("✅ Données exportées en JSON");
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "people.json";
    a.click();
    return json;
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

export async function exempleImport(jsonString) {
  try {
    const count = await crudService.importJSON(jsonString);
    console.log(`✅ ${count} personne(s) importée(s)`);
    return count;
  } catch (error) {
    console.error("❌ Erreur lors de l'import:", error);
  }
}

// ============================================================================
// 7️⃣ WORKFLOW COMPLET
// ============================================================================

export async function exempleWorkflowComplet() {
  console.log("🚀 WORKFLOW COMPLET CRUD\n");

  try {
    console.log("1️⃣ Création d'une personne...");
    const person = await crudService.create({
      firstName: "Marie",
      lastName: "Martin",
      role: "Designer",
      email: "marie.martin@example.com",
      phone: "+33698765432",
      bio: "UX/UI Designer passionnée",
    });
    console.log("   ✅ Créée:", person.id);

    console.log("\n2️⃣ Récupération de la personne...");
    const retrieved = await crudService.getById(person.id);
    console.log("   ✅ Récupérée:", retrieved?.firstName, retrieved?.lastName);

    console.log("\n3️⃣ Mise à jour de la personne...");
    const updated = await crudService.update(person.id, {
      bio: "UX/UI Designer avec 5 ans d'expérience",
    });
    console.log("   ✅ Mise à jour du bio");

    console.log("\n4️⃣ Récupération de toutes les personnes...");
    const all = await crudService.getAll();
    console.log(`   ✅ Total: ${all.length} personne(s)`);

    console.log("\n5️⃣ Recherche de 'Marie'...");
    const results = await crudService.search({ search: "Marie" });
    console.log(`   ✅ Trouvée: ${results.length} résultat(s)`);

    console.log("\n6️⃣ Statistiques...");
    const stats = await crudService.getStats();
    console.log("   ✅ Total:", stats.total);
    console.log("   ✅ Par rôle:", stats.byRole);

    console.log("\n7️⃣ Duplication de la personne...");
    const duplicate = await crudService.duplicate(person.id);
    console.log("   ✅ Dupliquée avec ID:", duplicate.id);

    console.log("\n8️⃣ Suppression du doublon...");
    await crudService.delete(duplicate.id);
    console.log("   ✅ Supprimée");

    console.log("\n✅ WORKFLOW COMPLET TERMINÉ\n");
  } catch (error) {
    console.error("❌ ERREUR:", error);
  }
}
