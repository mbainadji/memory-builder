import { trombiDB } from "./trombiDB";

/**
 * Service CRUD ES6 pour les personnes
 * Fournit une couche abstraite pour les opérations Create, Read, Update, Delete
 */
class CRUDService {
  /**
   * CREATE - Crée une nouvelle personne
   * @param {Object} data Les données de la personne (sans id ni timestamps)
   * @returns {Promise<Object>} La personne créée avec ses métadonnées
   */
  async create(data) {
    // Validation basique
    if (!data.firstName?.trim()) throw new Error("firstName is required");
    if (!data.lastName?.trim()) throw new Error("lastName is required");
    if (!data.role?.trim()) throw new Error("role is required");
    if (!data.email?.trim()) throw new Error("email is required");

    // Validation email
    if (!this.isValidEmail(data.email)) {
      throw new Error("Invalid email format");
    }

    // Validation photo - vérifier la taille
    if (data.photo) {
      if (data.photo.length > 1 * 1024 * 1024) {
        throw new Error("Photo too large (max 1 MB encoded)");
      }
    }

    return await trombiDB.create(data);
  }

  /**
   * READ - Récupère une personne par ID
   * @param {string} id L'ID de la personne
   * @returns {Promise<Object|undefined>} La personne ou undefined
   */
  async getById(id) {
    if (!id?.trim()) throw new Error("id is required");
    return await trombiDB.get(id);
  }

  /**
   * READ - Liste toutes les personnes
   * @returns {Promise<Array>} Tableau de toutes les personnes
   */
  async getAll() {
    return await trombiDB.list();
  }

  /**
   * READ - Recherche et filtre les personnes
   * @param {Object} options Les options de filtrage
   * @returns {Promise<Array>} Tableau de personnes filtrées
   */
  async search(options = {}) {
    const people = await this.getAll();
    let filtered = people;

    // Filtrer par rôle si fourni
    if (options.role) {
      filtered = filtered.filter((p) => p.role.toLowerCase() === options.role.toLowerCase());
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
   * @param {Object} pagination Options de pagination
   * @param {Object} filters Options de filtrage
   * @returns {Promise<Object>} Résultat paginé
   */
  async getPaginated(
    pagination = { page: 1, limit: 10 },
    filters = {}
  ) {
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
   * @param {string} id L'ID de la personne
   * @param {Object} data Les données à mettre à jour (partielle)
   * @returns {Promise<Object>} La personne mise à jour
   */
  async update(id, data) {
    if (!id?.trim()) throw new Error("id is required");

    // Vérifier que la personne existe
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Person with id ${id} not found`);

    // Validation si email est modifié
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error("Invalid email format");
    }

    // Validation photo - vérifier la taille
    if (data.photo !== undefined) {
      if (data.photo && data.photo.length > 1 * 1024 * 1024) {
        throw new Error("Photo too large (max 1 MB encoded)");
      }
    }

    return await trombiDB.update(id, data);
  }

  /**
   * DELETE - Supprime une personne
   * @param {string} id L'ID de la personne
   * @returns {Promise<void>}
   */
  async delete(id) {
    if (!id?.trim()) throw new Error("id is required");

    const existing = await this.getById(id);
    if (!existing) throw new Error(`Person with id ${id} not found`);

    await trombiDB.remove(id);
  }

  /**
   * DELETE - Supprime plusieurs personnes par IDs
   * @param {Array<string>} ids Les IDs des personnes à supprimer
   * @returns {Promise<number>} Le nombre de personnes supprimées
   */
  async deleteMultiple(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("ids must be a non-empty array");
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
   * @param {string|undefined} id L'ID de la personne (optionnel)
   * @param {Object} data Les données
   * @returns {Promise<Object>} La personne créée ou mise à jour
   */
  async upsert(id, data) {
    if (id) {
      const existing = await this.getById(id);
      if (existing) {
        return await this.update(id, data);
      }
    }
    return await this.create(data);
  }

  /**
   * Duplique une personne existante
   * @param {string} id L'ID de la personne à dupliquer
   * @returns {Promise<Object>} La personne dupliquée (nouvelle)
   */
  async duplicate(id) {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Person with id ${id} not found`);

    const { id: _id, createdAt: _c, updatedAt: _u, ...data } = existing;
    return await this.create(data);
  }

  /**
   * Obtient les statistiques sur les personnes
   * @returns {Promise<Object>} Objet avec statistiques
   */
  async getStats() {
    const people = await this.getAll();
    const byRole = {};

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
   * @param {string} email L'email à valider
   * @returns {boolean} true si valide, false sinon
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Exporte les données au format JSON
   * @returns {Promise<string>} String JSON contenant toutes les personnes
   */
  async exportJSON() {
    const people = await this.getAll();
    return JSON.stringify(people, null, 2);
  }

  /**
   * Importe des personnes depuis du JSON
   * @param {string} jsonString String JSON contenant les personnes
   * @returns {Promise<number>} Nombre de personnes importées
   */
  async importJSON(jsonString) {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) throw new Error("JSON must be an array of persons");

    let count = 0;
    for (const item of data) {
      try {
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
        console.error("Failed to import person:", error);
      }
    }
    return count;
  }
}

// Exporter une instance singleton du service
export const crudService = new CRUDService();

// Exporter aussi la classe pour les tests ou extensions
export { CRUDService };
