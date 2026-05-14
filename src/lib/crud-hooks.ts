/**
 * Hooks de gestion CRUD avec React Query
 * Intègre le service CRUD avec TanStack Query pour la gestion de l'état
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crudService } from './crud';
import type { Person } from './trombiDB';
import type { PersonFormValues } from '@/components/PersonForm';

// ============================================================================
// CLÉS DE REQUÊTE
// ============================================================================

export const queryKeys = {
  all: ['people'] as const,
  list: () => [...queryKeys.all, 'list'] as const,
  paginated: (page: number, limit: number) => [...queryKeys.all, 'paginated', page, limit] as const,
  search: (search: string) => [...queryKeys.all, 'search', search] as const,
  filter: (role: string) => [...queryKeys.all, 'filter', role] as const,
  stats: () => [...queryKeys.all, 'stats'] as const,
  detail: (id: string) => [...queryKeys.all, 'detail', id] as const,
};

// ============================================================================
// HOOKS DE REQUÊTE (READ)
// ============================================================================

/**
 * Hook pour récupérer toutes les personnes
 */
export function usePeople() {
  return useQuery({
    queryKey: queryKeys.list(),
    queryFn: () => crudService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook pour récupérer une personne par ID
 */
export function usePerson(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.detail(id || ''),
    queryFn: () => (id ? crudService.getById(id) : Promise.resolve(undefined)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook pour rechercher des personnes
 */
export function usePeopleSearch(search: string) {
  return useQuery({
    queryKey: queryKeys.search(search),
    queryFn: () => crudService.search({ search }),
    enabled: search.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook pour filtrer par rôle
 */
export function usePeopleByRole(role: string) {
  return useQuery({
    queryKey: queryKeys.filter(role),
    queryFn: () => crudService.search({ role }),
    enabled: role.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook pour récupérer les données paginées
 */
export function usePeoplePaginated(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.paginated(page, limit),
    queryFn: () => crudService.getPaginated({ page, limit }),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook pour obtenir les statistiques
 */
export function usePeopleStats() {
  return useQuery({
    queryKey: queryKeys.stats(),
    queryFn: () => crudService.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============================================================================
// HOOKS DE MUTATION (CREATE, UPDATE, DELETE)
// ============================================================================

/**
 * Hook pour créer une nouvelle personne
 */
export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PersonFormValues) => crudService.create(data),
    onSuccess: (newPerson) => {
      // Invalider et rafraîchir les requêtes concernées
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
      // Ou ajouter manuellement la nouvelle personne au cache
      queryClient.setQueryData(queryKeys.list(), (old: Person[] | undefined) => {
        return old ? [newPerson, ...old] : [newPerson];
      });
    },
  });
}

/**
 * Hook pour mettre à jour une personne
 */
export function useUpdatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PersonFormValues> }) =>
      crudService.update(id, data),
    onSuccess: (updatedPerson) => {
      // Invalider les requêtes concernées
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(updatedPerson.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
      // Mettre à jour le cache
      queryClient.setQueryData(queryKeys.detail(updatedPerson.id), updatedPerson);
    },
  });
}

/**
 * Hook pour supprimer une personne
 */
export function useDeletePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crudService.delete(id),
    onSuccess: (_data, deletedId) => {
      // Invalider les requêtes concernées
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
      // Retirer du cache
      queryClient.removeQueries({ queryKey: queryKeys.detail(deletedId) });
    },
  });
}

/**
 * Hook pour supprimer plusieurs personnes
 */
export function useDeletePeopleMultiple() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => crudService.deleteMultiple(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
    },
  });
}

/**
 * Hook pour dupliquer une personne
 */
export function useDuplicatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crudService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
    },
  });
}

// ============================================================================
// CUSTOM HOOKS COMPLEXES
// ============================================================================

/**
 * Hook combiné pour créer ou mettre à jour une personne
 */
export function useUpsertPerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | undefined; data: PersonFormValues }) =>
      crudService.upsert(id, data),
    onSuccess: (person) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(person.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
      queryClient.setQueryData(queryKeys.detail(person.id), person);
    },
  });
}

/**
 * Hook pour exporter les données
 */
export function useExportPeople() {
  return useMutation({
    mutationFn: () => crudService.exportJSON(),
    onSuccess: (json) => {
      // Déclencher le téléchargement
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `people-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

/**
 * Hook pour importer les données
 */
export function useImportPeople() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jsonString: string) => crudService.importJSON(jsonString),
    onSuccess: () => {
      // Invalider tous les caches
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
}

// ============================================================================
// EXEMPLE D'UTILISATION DANS UN COMPOSANT
// ============================================================================

/**
 * Exemple de composant utilisant les hooks CRUD avec React Query
 */
export function ExempleComposantCRUD() {
  // Récupérer les données
  const { data: people, isLoading, error } = usePeople();
  const { data: stats } = usePeopleStats();

  // Mutations
  const createMutation = useCreatePerson();
  const updateMutation = useUpdatePerson();
  const deleteMutation = useDeletePerson();

  const handleCreate = async (formData: PersonFormValues) => {
    try {
      await createMutation.mutateAsync(formData);
      // Toast de succès
    } catch (error) {
      console.error('Erreur de création:', error);
    }
  };

  const handleUpdate = async (id: string, formData: Partial<PersonFormValues>) => {
    try {
      await updateMutation.mutateAsync({ id, data: formData });
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Erreur de suppression:', error);
    }
  };

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {String(error)}</div>;

  return (
    <div>
      <h1>Trombinoscope ({people?.length || 0})</h1>
      {stats && (
        <div>
          <p>Personnes: {stats.total}</p>
          <p>Rôles: {Object.keys(stats.byRole).join(', ')}</p>
        </div>
      )}
      <ul>
        {people?.map((person) => (
          <li key={person.id}>
            {person.firstName} {person.lastName}
            <button onClick={() => handleUpdate(person.id, { bio: 'Nouveau bio' })}>
              Modifier
            </button>
            <button onClick={() => handleDelete(person.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
