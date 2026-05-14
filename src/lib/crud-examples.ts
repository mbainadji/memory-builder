/**
 * EXEMPLES D'UTILISATION DU SERVICE CRUD ES6
 * Ce fichier montre comment utiliser le service CRUD pour toutes les opérations
 */

import { crudService, type FilterOptions, type PaginationOptions } from './crud';
import type { PersonFormValues } from '@/components/PersonForm';

// ============================================================================
// CREATE - Créer une nouvelle personne
// ============================================================================

export async function exempleCreate() {
  try {
    const newPerson = await crudService.create({
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'Développeur',
      email: 'jean.dupont@example.com',
      phone: '+33612345678',
      bio: 'Expert fullstack',
      photo: '', // ou un data URL
    });

    console.log('✅ Personne créée:', newPerson);
    return newPerson;
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  }
}

// ============================================================================
// READ - Lire une ou plusieurs personnes
// ============================================================================

export async function exempleReadById(id: string) {
  try {
    const person = await crudService.getById(id);
    console.log('✅ Personne trouvée:', person);
    return person;
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

export async function exempleReadAll() {
  try {
    const allPeople = await crudService.getAll();
    console.log('✅ Toutes les personnes:', allPeople);
    return allPeople;
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// ============================================================================
// SEARCH & FILTER - Rechercher et filtrer
// ============================================================================

export async function exempleSearch(query: string) {
  try {
    const results = await crudService.search({
      search: query, // Cherche dans firstName, lastName, email
    });
    console.log(`✅ Résultats pour "${query}":`, results);
    return results;
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

export async function exempleFilterByRole(role: string) {
  try {
    const results = await crudService.search({
      role: role, // Ex: "Développeur"
    });
    console.log(`✅ Personnes avec le rôle "${role}":`, results);
    return results;
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

export async function exempleSearchAndFilter(query: string, role: string) {
  try {
    const results = await crudService.search({
      search: query,
      role: role,
    });
    console.log('✅ Résultats filtrés:', results);
    return results;
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// ============================================================================
// PAGINATION - Récupérer les données paginées
// ============================================================================

export async function exemplePagination(page: number = 1, limit: number = 10) {
  try {
    const result = await crudService.getPaginated(
      { page, limit },
      { search: '' } // Options de filtrage optionnelles
    );

    console.log('✅ Résultat paginé:', {
      items: result.items,
      page: result.page,
      total: result.total,
      totalPages: result.totalPages,
    });

    return result;
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

export async function exemplePaginationWithFilter(
  page: number = 1,
  limit: number = 10,
  role: string = 'Développeur'
) {
  try {
    const result = await crudService.getPaginated({ page, limit }, { role });
    console.log(`✅ Page ${page} des ${role}s:`, result);
    return result;
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// ============================================================================
// UPDATE - Mettre à jour une personne
// ============================================================================

export async function exempleUpdate(id: string) {
  try {
    const updated = await crudService.update(id, {
      firstName: 'Jean-Marie',
      bio: 'Expert fullstack JavaScript',
    });
    console.log('✅ Personne mise à jour:', updated);
    return updated;
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  }
}

// ============================================================================
// DELETE - Supprimer une ou plusieurs personnes
// ============================================================================

export async function exempleDelete(id: string) {
  try {
    await crudService.delete(id);
    console.log('✅ Personne supprimée');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
  }
}

export async function exempleDeleteMultiple(ids: string[]) {
  try {
    const count = await crudService.deleteMultiple(ids);
    console.log(`✅ ${count} personne(s) supprimée(s)`);
    return count;
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// ============================================================================
// UPSERT - Créer ou mettre à jour
// ============================================================================

export async function exempleUpsert(id: string | undefined, data: PersonFormValues) {
  try {
    const result = await crudService.upsert(id, data);
    console.log('✅ Personne créée ou mise à jour:', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// ============================================================================
// DUPLICATE - Dupliquer une personne
// ============================================================================

export async function exempleDuplicate(id: string) {
  try {
    const duplicate = await crudService.duplicate(id);
    console.log('✅ Personne dupliquée:', duplicate);
    return duplicate;
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// ============================================================================
// STATISTICS - Obtenir les statistiques
// ============================================================================

export async function exempleStats() {
  try {
    const stats = await crudService.getStats();
    console.log('✅ Statistiques:', {
      total: stats.total,
      byRole: stats.byRole,
      recentlyUpdated: stats.recentlyUpdated.map((p) => `${p.firstName} ${p.lastName}`),
    });
    return stats;
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// ============================================================================
// EXPORT/IMPORT - Exporter et importer les données
// ============================================================================

export async function exempleExport() {
  try {
    const json = await crudService.exportJSON();
    console.log('✅ Données exportées en JSON');
    // Télécharger le fichier
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'people.json';
    a.click();
    return json;
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

export async function exempleImport(jsonString: string) {
  try {
    const count = await crudService.importJSON(jsonString);
    console.log(`✅ ${count} personne(s) importée(s)`);
    return count;
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
  }
}

// ============================================================================
// WORKFLOW COMPLET - Exemple d'un workflow complet
// ============================================================================

export async function exempleWorkflowComplet() {
  console.log('🚀 WORKFLOW COMPLET CRUD\n');

  try {
    // 1. Créer une personne
    console.log('1️⃣ Création d\'une personne...');
    const person = await crudService.create({
      firstName: 'Marie',
      lastName: 'Martin',
      role: 'Designer',
      email: 'marie.martin@example.com',
      phone: '+33698765432',
      bio: 'UX/UI Designer passionnée',
    });
    console.log('   ✅ Créée:', person.id);

    // 2. Récupérer la personne
    console.log('\n2️⃣ Récupération de la personne...');
    const retrieved = await crudService.getById(person.id);
    console.log('   ✅ Récupérée:', retrieved?.firstName, retrieved?.lastName);

    // 3. Mettre à jour
    console.log('\n3️⃣ Mise à jour de la personne...');
    const updated = await crudService.update(person.id, {
      bio: 'UX/UI Designer avec 5 ans d\'expérience',
    });
    console.log('   ✅ Mise à jour du bio');

    // 4. Lister toutes les personnes
    console.log('\n4️⃣ Récupération de toutes les personnes...');
    const all = await crudService.getAll();
    console.log(`   ✅ Total: ${all.length} personne(s)`);

    // 5. Rechercher
    console.log('\n5️⃣ Recherche de "Marie"...');
    const results = await crudService.search({ search: 'Marie' });
    console.log(`   ✅ Trouvée: ${results.length} résultat(s)`);

    // 6. Obtenir les statistiques
    console.log('\n6️⃣ Statistiques...');
    const stats = await crudService.getStats();
    console.log('   ✅ Total:', stats.total);
    console.log('   ✅ Par rôle:', stats.byRole);

    // 7. Dupliquer
    console.log('\n7️⃣ Duplication de la personne...');
    const duplicate = await crudService.duplicate(person.id);
    console.log('   ✅ Dupliquée avec ID:', duplicate.id);

    // 8. Paginer les résultats
    console.log('\n8️⃣ Pagination (page 1, limit 5)...');
    const paginated = await crudService.getPaginated({ page: 1, limit: 5 });
    console.log(`   ✅ Page 1: ${paginated.items.length}/${paginated.total}`);

    // 9. Supprimer la personne dupliquée
    console.log('\n9️⃣ Suppression du doublon...');
    await crudService.delete(duplicate.id);
    console.log('   ✅ Supprimée');

    // 10. Exporter
    console.log('\n🔟 Export JSON...');
    const json = await crudService.exportJSON();
    console.log('   ✅ Exportée');

    console.log('\n✅ WORKFLOW COMPLET TERMINÉ\n');
  } catch (error) {
    console.error('❌ ERREUR:', error);
  }
}

// ============================================================================
// UTILISATION DANS UN COMPOSANT REACT
// ============================================================================

export function ExempleComposantReact() {
  return (
    `
    import { useState, useEffect } from 'react';
    import { crudService } from '@/lib/crud';
    import type { Person } from '@/lib/trombiDB';

    export function MonComposant() {
      const [people, setPeople] = useState<Person[]>([]);
      const [loading, setLoading] = useState(false);

      // Charger les données au montage
      useEffect(() => {
        loadPeople();
      }, []);

      // Charger toutes les personnes
      const loadPeople = async () => {
        setLoading(true);
        try {
          const data = await crudService.getAll();
          setPeople(data);
        } catch (error) {
          console.error('Erreur:', error);
        } finally {
          setLoading(false);
        }
      };

      // Créer une nouvelle personne
      const handleCreate = async (formData) => {
        try {
          const newPerson = await crudService.create(formData);
          setPeople([...people, newPerson]);
          // Afficher un toast de succès
        } catch (error) {
          console.error('Erreur:', error);
        }
      };

      // Mettre à jour une personne
      const handleUpdate = async (id: string, formData) => {
        try {
          const updated = await crudService.update(id, formData);
          setPeople(people.map((p) => (p.id === id ? updated : p)));
        } catch (error) {
          console.error('Erreur:', error);
        }
      };

      // Supprimer une personne
      const handleDelete = async (id: string) => {
        try {
          await crudService.delete(id);
          setPeople(people.filter((p) => p.id !== id));
        } catch (error) {
          console.error('Erreur:', error);
        }
      };

      // Rechercher
      const handleSearch = async (query: string) => {
        try {
          const results = await crudService.search({ search: query });
          setPeople(results);
        } catch (error) {
          console.error('Erreur:', error);
        }
      };

      return (
        <div>
          {loading ? <p>Chargement...</p> : <p>{people.length} personne(s)</p>}
          {/* Ton UI ici */}
        </div>
      );
    }
    `
  );
}
