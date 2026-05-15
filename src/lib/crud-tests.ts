/**
 * Tests pour le service CRUD
 * Utilise un framework de test simple pour démontrer les tests
 */

import { crudService } from "./crud";
import type { PersonFormValues } from "@/components/PersonForm";

// ============================================================================
// FRAMEWORK DE TEST SIMPLE
// ============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: Error;
  duration: number;
}

class TestRunner {
  private results: TestResult[] = [];

  async test(name: string, fn: () => Promise<void>) {
    const start = performance.now();
    try {
      await fn();
      const duration = performance.now() - start;
      this.results.push({ name, passed: true, duration });
      console.log(`✅ ${name} (${duration.toFixed(2)}ms)`);
    } catch (error) {
      const duration = performance.now() - start;
      this.results.push({
        name,
        passed: false,
        error: error as Error,
        duration,
      });
      console.error(`❌ ${name}`);
      console.error(`   ${(error as Error).message}`);
    }
  }

  summary() {
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    const total = this.results.length;
    const time = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log("\n" + "=".repeat(50));
    console.log(`Tests: ${passed}/${total} passed, ${failed} failed`);
    console.log(`Time: ${time.toFixed(2)}ms`);
    console.log("=".repeat(50) + "\n");

    return { passed, failed, total };
  }
}

// ============================================================================
// UTILITAIRES DE TEST
// ============================================================================

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
  }
}

function assertExists<T>(value: T | null | undefined, message: string): T {
  if (!value) throw new Error(`${message} - Value is null/undefined`);
  return value;
}

// ============================================================================
// TESTS CRUD
// ============================================================================

export async function runCRUDTests() {
  const runner = new TestRunner();

  let testPersonId: string;
  const testData: PersonFormValues = {
    firstName: "Test",
    lastName: "User",
    role: "Tester",
    email: "test@example.com",
    phone: "+33600000000",
    bio: "Test bio",
  };

  // ──────────────────────────────────────────────────────────────────────
  // CREATE Tests
  // ──────────────────────────────────────────────────────────────────────

  await runner.test("CREATE: Créer une personne valide", async () => {
    const person = await crudService.create(testData);
    testPersonId = person.id;

    assert(person.id, "L'ID ne doit pas être vide");
    assertEquals(person.firstName, testData.firstName, "firstName");
    assertEquals(person.lastName, testData.lastName, "lastName");
    assertEquals(person.email, testData.email, "email");
    assert(person.createdAt > 0, "createdAt doit être défini");
    assert(person.updatedAt > 0, "updatedAt doit être défini");
  });

  await runner.test("CREATE: Rejeter firstName vide", async () => {
    try {
      await crudService.create({
        ...testData,
        firstName: "",
      });
      throw new Error("Devrait rejeter firstName vide");
    } catch (error) {
      assert((error as Error).message.includes("firstName"), "Erreur doit mentionner firstName");
    }
  });

  await runner.test("CREATE: Rejeter email invalide", async () => {
    try {
      await crudService.create({
        ...testData,
        email: "invalid-email",
      });
      throw new Error("Devrait rejeter email invalide");
    } catch (error) {
      assert((error as Error).message.includes("email"), "Erreur doit mentionner email");
    }
  });

  // ──────────────────────────────────────────────────────────────────────
  // READ Tests
  // ──────────────────────────────────────────────────────────────────────

  await runner.test("READ: Récupérer une personne par ID", async () => {
    const person = await crudService.getById(testPersonId);
    const retrieved = assertExists(person, "Personne doit exister");

    assertEquals(retrieved.id, testPersonId, "ID");
    assertEquals(retrieved.firstName, testData.firstName, "firstName");
  });

  await runner.test("READ: Retourner undefined pour ID inexistant", async () => {
    const person = await crudService.getById("invalid-id-12345");
    assertEquals(person, undefined, "Doit retourner undefined");
  });

  await runner.test("READ: Lister toutes les personnes", async () => {
    const people = await crudService.getAll();

    assert(Array.isArray(people), "Doit retourner un tableau");
    assert(people.length > 0, "Doit contenir au moins une personne");

    const found = people.find((p) => p.id === testPersonId);
    assert(found, "La personne de test doit être dans la liste");
  });

  // ──────────────────────────────────────────────────────────────────────
  // SEARCH Tests
  // ──────────────────────────────────────────────────────────────────────

  await runner.test("SEARCH: Rechercher par firstName", async () => {
    const results = await crudService.search({ search: testData.firstName });

    assert(results.length > 0, "Doit trouver la personne");
    const found = results.find((p) => p.id === testPersonId);
    assert(found, "La personne de test doit être dans les résultats");
  });

  await runner.test("SEARCH: Rechercher par lastName", async () => {
    const results = await crudService.search({ search: testData.lastName });

    assert(results.length > 0, "Doit trouver la personne");
  });

  await runner.test("SEARCH: Rechercher par email", async () => {
    const results = await crudService.search({ search: testData.email });

    assert(results.length > 0, "Doit trouver la personne");
  });

  await runner.test("SEARCH: Cherche insensible à la casse", async () => {
    const results = await crudService.search({ search: testData.firstName.toLowerCase() });

    assert(results.length > 0, "Doit trouver la personne");
  });

  await runner.test("SEARCH: Filtrer par rôle", async () => {
    const results = await crudService.search({ role: testData.role });

    assert(results.length > 0, "Doit trouver au moins une personne");
    const found = results.find((p) => p.id === testPersonId);
    assert(found, "La personne de test doit avoir le bon rôle");
  });

  await runner.test("SEARCH: Combiner recherche et filtre", async () => {
    const results = await crudService.search({
      search: testData.firstName,
      role: testData.role,
    });

    assert(results.length > 0, "Doit trouver la personne");
  });

  // ──────────────────────────────────────────────────────────────────────
  // PAGINATION Tests
  // ──────────────────────────────────────────────────────────────────────

  await runner.test("PAGINATION: Récupérer la première page", async () => {
    const result = await crudService.getPaginated({ page: 1, limit: 5 });

    assert(Array.isArray(result.items), "items doit être un tableau");
    assertEquals(result.page, 1, "page");
    assertEquals(result.limit, 5, "limit");
    assert(result.total > 0, "total doit être > 0");
    assert(result.totalPages > 0, "totalPages doit être > 0");
  });

  await runner.test("PAGINATION: Limite le nombre d'éléments", async () => {
    const result = await crudService.getPaginated({ page: 1, limit: 2 });

    assert(result.items.length <= 2, "Doit respecter la limite");
  });

  // ──────────────────────────────────────────────────────────────────────
  // UPDATE Tests
  // ──────────────────────────────────────────────────────────────────────

  await runner.test("UPDATE: Mettre à jour une personne", async () => {
    const updated = await crudService.update(testPersonId, {
      bio: "Updated bio",
    });

    assertEquals(updated.id, testPersonId, "ID ne doit pas changer");
    assertEquals(updated.bio, "Updated bio", "bio");
    assert(updated.updatedAt > updated.createdAt, "updatedAt doit être plus récent");
  });

  await runner.test("UPDATE: Mettre à jour plusieurs champs", async () => {
    const updated = await crudService.update(testPersonId, {
      firstName: "UpdatedFirst",
      lastName: "UpdatedLast",
      role: "NewRole",
    });

    assertEquals(updated.firstName, "UpdatedFirst", "firstName");
    assertEquals(updated.lastName, "UpdatedLast", "lastName");
    assertEquals(updated.role, "NewRole", "role");
  });

  await runner.test("UPDATE: Rejeter email invalide", async () => {
    try {
      await crudService.update(testPersonId, {
        email: "invalid",
      });
      throw new Error("Devrait rejeter email invalide");
    } catch (error) {
      assert((error as Error).message.includes("email"), "Erreur doit mentionner email");
    }
  });

  await runner.test("UPDATE: ID inexistant lève une erreur", async () => {
    try {
      await crudService.update("invalid-id", { firstName: "Test" });
      throw new Error("Devrait lever une erreur");
    } catch (error) {
      assert((error as Error).message.includes("not found"), 'Erreur doit dire "not found"');
    }
  });

  // ──────────────────────────────────────────────────────────────────────
  // DELETE Tests
  // ──────────────────────────────────────────────────────────────────────

  let deleteTestId: string;

  await runner.test("DELETE: Créer une personne pour suppression", async () => {
    const person = await crudService.create({
      ...testData,
      firstName: "ToDelete",
      email: "todelete@example.com",
    });
    deleteTestId = person.id;
    assert(deleteTestId, "ID doit être défini");
  });

  await runner.test("DELETE: Supprimer une personne", async () => {
    await crudService.delete(deleteTestId);

    const person = await crudService.getById(deleteTestId);
    assertEquals(person, undefined, "Personne ne doit plus exister");
  });

  await runner.test("DELETE: Supprimer ID inexistant lève une erreur", async () => {
    try {
      await crudService.delete("invalid-id");
      throw new Error("Devrait lever une erreur");
    } catch (error) {
      assert((error as Error).message.includes("not found"), 'Erreur doit dire "not found"');
    }
  });

  // ──────────────────────────────────────────────────────────────────────
  // UPSERT Tests
  // ──────────────────────────────────────────────────────────────────────

  await runner.test("UPSERT: Créer si ID undefined", async () => {
    const person = await crudService.upsert(undefined, {
      ...testData,
      firstName: "Upserted",
      email: "upsert@example.com",
    });

    assert(person.id, "Doit avoir un nouvel ID");
    assertEquals(person.firstName, "Upserted", "firstName");
  });

  await runner.test("UPSERT: Mettre à jour si ID existe", async () => {
    const person = await crudService.upsert(testPersonId, {
      ...testData,
      firstName: "UpsertedUpdate",
    });

    assertEquals(person.id, testPersonId, "ID doit être le même");
    assertEquals(person.firstName, "UpsertedUpdate", "firstName doit être mis à jour");
  });

  // ──────────────────────────────────────────────────────────────────────
  // DUPLICATE Tests
  // ──────────────────────────────────────────────────────────────────────

  await runner.test("DUPLICATE: Dupliquer une personne", async () => {
    const duplicate = await crudService.duplicate(testPersonId);

    assert(duplicate.id !== testPersonId, "Nouvel ID");
    assertEquals(duplicate.firstName, testData.firstName, "firstName");
    assertEquals(duplicate.lastName, testData.lastName, "lastName");
  });

  // ──────────────────────────────────────────────────────────────────────
  // STATS Tests
  // ──────────────────────────────────────────────────────────────────────

  await runner.test("STATS: Obtenir les statistiques", async () => {
    const stats = await crudService.getStats();

    assert(stats.total >= 0, "total >= 0");
    assert(typeof stats.byRole === "object", "byRole doit être un objet");
    assert(Array.isArray(stats.recentlyUpdated), "recentlyUpdated doit être un tableau");
  });

  // ──────────────────────────────────────────────────────────────────────
  // EXPORT/IMPORT Tests
  // ──────────────────────────────────────────────────────────────────────

  await runner.test("EXPORT: Exporter en JSON", async () => {
    const json = await crudService.exportJSON();

    assert(typeof json === "string", "Doit retourner un string");
    const data = JSON.parse(json);
    assert(Array.isArray(data), "JSON doit contenir un tableau");
  });

  // ──────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────────────────────────────

  return runner.summary();
}

// Exporter pour utilisation dans d'autres fichiers
export { TestRunner, assert, assertEquals, assertExists };
