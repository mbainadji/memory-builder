/**
 * Barrel export pour le module CRUD
 * Importe simplement: import { crudService, usePeople, ... } from '@/lib/crud-index'
 */

// Service CRUD principal
export { crudService, CRUDService } from './crud';
export type { PaginationOptions, PaginatedResult, FilterOptions } from './crud';

// Hooks React Query
export {
  queryKeys,
  usePeople,
  usePerson,
  usePeopleSearch,
  usePeopleByRole,
  usePeoplePaginated,
  usePeopleStats,
  useCreatePerson,
  useUpdatePerson,
  useDeletePerson,
  useDeletePeopleMultiple,
  useDuplicatePerson,
  useUpsertPerson,
  useExportPeople,
  useImportPeople,
} from './crud-hooks';

// Tests
export { runCRUDTests, TestRunner, assert, assertEquals, assertExists } from './crud-tests';

// Types
export type { Person } from './trombiDB';
export type { PersonFormValues } from '@/components/PersonForm';
