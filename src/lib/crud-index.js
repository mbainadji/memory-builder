/**
 * Barrel export pour le module CRUD (ES6 pur)
 * Importe simplement: import { crudService, usePeople, ... } from '@/lib/crud-index'
 */

// Service CRUD principal
export { crudService, CRUDService } from "./crud.js";

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
} from "./crud-hooks.js";

// Image utils
export {
  compressImage,
  processImageFile,
  getImageInfo,
  isValidImageData,
} from "./image-utils.js";
