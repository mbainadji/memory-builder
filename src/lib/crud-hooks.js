import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crudService } from "./crud";

/**
 * CLÉS DE REQUÊTE
 */
export const queryKeys = {
  all: ["people"],
  list: () => [...queryKeys.all, "list"],
  paginated: (page, limit) => [...queryKeys.all, "paginated", page, limit],
  search: (search) => [...queryKeys.all, "search", search],
  filter: (role) => [...queryKeys.all, "filter", role],
  stats: () => [...queryKeys.all, "stats"],
  detail: (id) => [...queryKeys.all, "detail", id],
};

/**
 * Hook pour récupérer toutes les personnes
 */
export function usePeople() {
  return useQuery({
    queryKey: queryKeys.list(),
    queryFn: () => crudService.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook pour récupérer une personne par ID
 */
export function usePerson(id) {
  return useQuery({
    queryKey: queryKeys.detail(id || ""),
    queryFn: () => (id ? crudService.getById(id) : Promise.resolve(undefined)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook pour rechercher des personnes
 */
export function usePeopleSearch(search) {
  return useQuery({
    queryKey: queryKeys.search(search),
    queryFn: () => crudService.search({ search }),
    enabled: search?.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook pour filtrer par rôle
 */
export function usePeopleByRole(role) {
  return useQuery({
    queryKey: queryKeys.filter(role),
    queryFn: () => crudService.search({ role }),
    enabled: role?.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook pour récupérer les données paginées
 */
export function usePeoplePaginated(page = 1, limit = 10) {
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
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook pour créer une nouvelle personne
 */
export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => crudService.create(data),
    onSuccess: (newPerson) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
      queryClient.setQueryData(queryKeys.list(), (old) => {
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
    mutationFn: ({ id, data }) => crudService.update(id, data),
    onSuccess: (updatedPerson) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(updatedPerson.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
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
    mutationFn: (id) => crudService.delete(id),
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
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
    mutationFn: (ids) => crudService.deleteMultiple(ids),
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
    mutationFn: (id) => crudService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
    },
  });
}

/**
 * Hook combiné pour créer ou mettre à jour une personne
 */
export function useUpsertPerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => crudService.upsert(id, data),
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
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
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
    mutationFn: (jsonString) => crudService.importJSON(jsonString),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
}
