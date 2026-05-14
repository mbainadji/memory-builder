import { trombiDB, type Person } from './trombiDB';
import type { PersonFormValues } from '@/components/PersonForm';

/**
 * Interface pour la pagination
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Interface pour les résultats paginés
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Interface pour les options de filtrage
 */
export interface FilterOptions {
  role?: string;
  search?: string; // Cherche dans firstName, lastName, email
}

/**
 * Service CRUD ES6 pour les personnes
 * Fournit une couche abstraite pour les opérations Create, Read, Update, Delete
 */
class CRUDService {
  /**
   * CREATE - Crée une nouvelle personne
   * @param data Les données de la personne (sans id ni timestamps)
   * @returns La personne créée avec ses métadonnées
   */
  async create(data: PersonFormValues): Promise<Person> {
    // Validation basique
    if (!data.firstName?.trim()) throw new Error('firstName is required');
    if (!data.lastName?.trim()) throw new Error('lastName is required');
    if (!data.role?.trim()) throw new Error('role is required');
    if (!data.email?.trim()) throw new Error('email is required');

    // Validation email
    if (!this.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    return await trombiDB.create(data);
  }

  /**
   * READ - Récupère une personne par ID
   * @param id L'ID de la personne
   * @returns La personne ou undefined
   */
  async getById(id: string): Promise<Person | undefined> {
    if (!id?.trim()) throw new Error('id is required');
    return await trombiDB.get(id);
  }

  /**
   * READ - Liste toutes les personnes
   * @returns Tableau de toutes les personnes
   */
  async getAll(): Promise<Person[]> {
    return await trombiDB.list();
  }

  /**
   * READ - Recherche et filtre les personnes
   * @param options Les options de filtrage
   * @returns Tableau de personnes filtrées
   */
  async search(options: FilterOptions = {}): Promise<Person[]> {
    const people = await this.getAll();
    let filtered = people;

    // Filtrer par rôle si fourni
    if (options.role) {
      filtered = filtered.filter((p) => p.role.toLowerCase() === options.role!.toLowerCase());
    }

    // Filtrer par recherche textuelle si fournie
    if (options.search) {
      const query = options.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.firstName.toLowerCase().includes(query) ||
          p.lastName.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  /**
   * READ - Récupère les personnes paginées
   * @param pagination Options de pagination
   * @param filters Options de filtrage
   * @returns Résultat paginé
   */
  async getPaginated(
    pagination: PaginationOptions = { page: 1, limit: 10 },
    filters?: FilterOptions
  ): Promise<PaginatedResult<Person>> {
    const filtered = await this.search(filters);
    const total = filtered.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const start = (pagination.page - 1) * pagination.limit;
    const items = filtered.slice(start, start + pagination.limit);

    return {
      items,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
    };
  }

  /**
   * UPDATE - Met à jour une personne existante
   * @param id L'ID de la personne
   * @param data Les données à mettre à jour (partielle)
   * @returns La personne mise à jour
   */
  async update(id: string, data: Partial<PersonFormValues>): Promise<Person> {
    if (!id?.trim()) throw new Error('id is required');

    // Vérifier que la personne existe
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Person with id ${id} not found`);

    // Validation si email est modifié
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    return await trombiDB.update(id, data);
  }

  /**
   * DELETE - Supprime une personne
   * @param id L'ID de la personne
   */
  async delete(id: string): Promise<void> {
    if (!id?.trim()) throw new Error('id is required');

    const existing = await this.getById(id);
    if (!existing) throw new Error(`Person with id ${id} not found`);

    await trombiDB.remove(id);
  }

  /**
   * DELETE - Supprime plusieurs personnes par IDs
   * @param ids Les IDs des personnes à supprimer
   * @returns Le nombre de personnes supprimées
   */
  async deleteMultiple(ids: string[]): Promise<number> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('ids must be a non-empty array');
    }

    let count = 0;
    for (const id of ids) {
      try {
        await this.delete(id);
        count++;
      } catch (error) {
        console.error(`Failed to delete person with id ${id}:`, error);
      }
    }
    return count;
  }

  /**
   * Crée ou met à jour une personne (upsert)
   * @param id L'ID de la personne (optionnel)
   * @param data Les données
   * @returns La personne créée ou mise à jour
   */
  async upsert(id: string | undefined, data: PersonFormValues): Promise<Person> {
    if (id) {
      // Vérifier si la personne existe
      const existing = await this.getById(id);
      if (existing) {
        return await this.update(id, data);
      }
    }
    // Créer une nouvelle personne
    return await this.create(data);
  }

  /**
   * Duplique une personne existante
   * @param id L'ID de la personne à dupliquer
   * @returns La personne dupliquée (nouvelle)
   */
  async duplicate(id: string): Promise<Person> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Person with id ${id} not found`);

    const { id: _id, createdAt: _c, updatedAt: _u, ...data } = existing;
    return await this.create(data);
  }

  /**
   * Obtient les statistiques sur les personnes
   * @returns Objet avec statistiques
   */
  async getStats(): Promise<{
    total: number;
    byRole: Record<string, number>;
    recentlyUpdated: Person[];
  }> {
    const people = await this.getAll();
    const byRole: Record<string, number> = {};

    for (const person of people) {
      byRole[person.role] = (byRole[person.role] || 0) + 1;
    }

    const recentlyUpdated = [...people].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);

    return {
      total: people.length,
      byRole,
      recentlyUpdated,
    };
  }

  /**
   * Valide le format d'une adresse email
   * @param email L'email à valider
   * @returns true si valide, false sinon
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Exporte les données au format JSON
   * @returns String JSON contenant toutes les personnes
   */
  async exportJSON(): Promise<string> {
    const people = await this.getAll();
    return JSON.stringify(people, null, 2);
  }

  /**
   * Importe des personnes depuis du JSON
   * @param jsonString String JSON contenant les personnes
   * @returns Nombre de personnes importées
   */
  async importJSON(jsonString: string): Promise<number> {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) throw new Error('JSON must be an array of persons');

    let count = 0;
    for (const item of data) {
      try {
        // Valider que l'item contient les champs requis
        if (item.firstName && item.lastName && item.role && item.email) {
          await this.create({
            firstName: item.firstName,
            lastName: item.lastName,
            role: item.role,
            email: item.email,
            phone: item.phone,
            bio: item.bio,
            photo: item.photo,
          });
          count++;
        }
      } catch (error) {
        console.error('Failed to import person:', error);
      }
    }
    return count;
  }
}

// Exporter une instance singleton du service
export const crudService = new CRUDService();

// Exporter aussi la classe pour les tests ou extensions
export { CRUDService };
