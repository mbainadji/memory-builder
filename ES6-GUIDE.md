# 🎯 Guide ES6 Pur - Sans TypeScript

Vous avez demandé ES6 pur sans TypeScript. Voici tout ce qu'il faut savoir.

## 📁 Fichiers ES6 pur créés

| Fichier ES6 | Original TypeScript | Description |
|------------|-------------------|-------------|
| `src/lib/crud.js` | `src/lib/crud.ts` | Service CRUD complet |
| `src/lib/crud-hooks.js` | `src/lib/crud-hooks.ts` | Hooks React Query |
| `src/lib/image-utils.js` | `src/lib/image-utils.ts` | Compression d'images |
| `src/lib/crud-index.js` | `src/lib/crud-index.ts` | Barrel exports |
| `src/lib/crud-examples.js` | `src/lib/crud-examples.ts` | Exemples d'utilisation |
| `src/components/PersonForm.jsx` | `src/components/PersonForm.tsx` | Formulaire React |

## 🔄 Comment utiliser les versions ES6

### Option 1: Importer les fichiers .js directement

```javascript
// Au lieu de:
import { crudService } from "@/lib/crud-hooks";

// Utilisez:
import { crudService } from "@/lib/crud.js";
import { usePeople, useCreatePerson } from "@/lib/crud-hooks.js";
import { processImageFile } from "@/lib/image-utils.js";
```

### Option 2: Utiliser le barrel export (recommandé)

```javascript
// Importe tous les exports en une seule ligne:
import {
  crudService,
  CRUDService,
  queryKeys,
  usePeople,
  useCreatePerson,
  useUpdatePerson,
  useDeletePerson,
  compressImage,
  processImageFile,
  getImageInfo,
} from "@/lib/crud-index.js";
```

## ✅ Syntaxe ES6 pure utilisée

### ❌ Pas de TypeScript:
```typescript
// ❌ Éviter:
import type { Person } from "@/lib/trombiDB";

interface Props {
  initial?: Person;
  onSubmit: (values: PersonFormValues) => Promise<void>;
}

function MyComponent({ initial, onSubmit }: Props) {
  const [values, setValues] = useState<PersonFormValues>(empty);
}
```

### ✅ ES6 pur avec JSDoc:
```javascript
// ✅ Utiliser:
import { trombiDB } from "@/lib/trombiDB";

/**
 * @typedef {Object} Props
 * @property {Object} initial
 * @property {Function} onSubmit
 */

/**
 * @param {Props} props
 */
function MyComponent({ initial, onSubmit }) {
  const [values, setValues] = useState(empty);
}
```

## 🚀 Exemples ES6 pur

### Créer une personne
```javascript
import { crudService } from "@/lib/crud.js";

const person = await crudService.create({
  firstName: "Jean",
  lastName: "Dupont",
  role: "Développeur",
  email: "jean@example.com",
});
console.log("Créée:", person.id);
```

### Utiliser React Query avec les hooks
```javascript
import { usePeople, useCreatePerson } from "@/lib/crud-hooks.js";
import { useState } from "react";

export function MyComponent() {
  const { data: people } = usePeople();
  const createMutation = useCreatePerson();

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      firstName: "Alice",
      lastName: "Smith",
      role: "Designer",
      email: "alice@example.com",
    });
  };

  return (
    <div>
      <p>{people?.length || 0} personnes</p>
      <button onClick={handleCreate}>Créer</button>
    </div>
  );
}
```

### Traiter une image
```javascript
import { processImageFile, getImageInfo } from "@/lib/image-utils.js";

const handleImageChange = async (file) => {
  try {
    const compressed = await processImageFile(file);
    const info = getImageInfo(compressed);
    console.log(`Image compressée: ${info.sizeDisplay}`);
    // Utiliser compressed (base64)
  } catch (error) {
    console.error(error.message);
  }
};
```

## 🧪 Exemples d'utilisation

```javascript
// Tous les exemples sont dans src/lib/crud-examples.js
import {
  exempleCreate,
  exempleReadAll,
  exempleSearch,
  exemplePagination,
  exempleUpdate,
  exempleDelete,
  exempleStats,
  exempleExport,
  exempleImport,
  exempleWorkflowComplet,
} from "@/lib/crud-examples.js";

// Appel workflow complet:
await exempleWorkflowComplet();
```

## 📋 JSDoc vs Types

### Classe avec JSDoc
```javascript
/**
 * Service CRUD pour les personnes
 */
class CRUDService {
  /**
   * Crée une personne
   * @param {Object} data - Les données
   * @param {string} data.firstName - Le prénom
   * @param {string} data.lastName - Le nom
   * @param {string} data.role - Le rôle
   * @param {string} data.email - L'email
   * @returns {Promise<Object>} La personne créée
   */
  async create(data) {
    // ...
  }
}
```

### Hook avec JSDoc
```javascript
/**
 * Hook pour récupérer toutes les personnes
 * @returns {Object} Query result
 * @returns {Array} result.data - Les personnes
 * @returns {boolean} result.isLoading - Chargement
 * @returns {Error} result.error - Erreur
 */
export function usePeople() {
  return useQuery({
    queryKey: queryKeys.list(),
    queryFn: () => crudService.getAll(),
  });
}
```

## 🎛️ Configuration VS Code pour ES6

### .vscode/settings.json
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "javascript.inlayHints.parameterNames.enabled": true,
  "javascript.inlayHints.variableTypes.enabled": true
}
```

### Jsconfig.json (optionnel mais utile)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "allowJs": true,
    "checkJs": false
  },
  "include": ["src"]
}
```

## 💡 Bonnes pratiques ES6

### ✅ Utiliser const/let
```javascript
// ✅ Bon:
const CHUNK_SIZE = 1000;
let currentIndex = 0;

// ❌ Éviter:
var chunkSize = 1000;
```

### ✅ Déstructuration
```javascript
// ✅ Bon:
const { firstName, lastName, email } = person;
const [people, setPeople] = useState([]);

// ❌ Éviter:
const firstName = person.firstName;
const lastName = person.lastName;
```

### ✅ Template literals
```javascript
// ✅ Bon:
console.log(`${count} personne(s) trouvée(s)`);

// ❌ Éviter:
console.log(count + " personne(s) trouvée(s)");
```

### ✅ Arrow functions
```javascript
// ✅ Bon:
const double = (x) => x * 2;
const greet = () => "Hello";

// ❌ Éviter:
const double = function(x) { return x * 2; };
```

### ✅ Async/await
```javascript
// ✅ Bon:
async function fetchPeople() {
  try {
    const data = await crudService.getAll();
    return data;
  } catch (error) {
    console.error(error);
  }
}

// ❌ Éviter:
function fetchPeople() {
  return crudService.getAll().then(data => {
    return data;
  }).catch(error => {
    console.error(error);
  });
}
```

## 🚨 Supprimer les fichiers TypeScript (optionnel)

Si vous voulez vraiment supprimer les fichiers TypeScript:

```bash
# Sauvegardez d'abord:
cp src/lib/crud.ts src/lib/crud.ts.bak

# Puis supprimez:
rm src/lib/*.ts
rm src/components/*.tsx
rm src/lib/*.ts.map  # Maps TypeScript
```

⚠️ **Attention**: Gardez les fichiers `.ts` existants du projet qui ne sont pas liés au CRUD!

## 📦 Dépendances (inchangées)

```json
{
  "dependencies": {
    "react": "^19.x",
    "@tanstack/react-router": "latest",
    "@tanstack/react-query": "latest",
    "lucide-react": "latest",
    "@radix-ui/*": "latest",
    "sonner": "latest"
  }
}
```

## 🎓 Résumé

| Aspect | TypeScript | ES6 |
|--------|-----------|-----|
| Fichiers | `.ts`, `.tsx` | `.js`, `.jsx` |
| Types | `interface`, `type` | JSDoc commentaires |
| Compilation | Require tsc | Utilise Babel/Vite |
| Erreurs | Compilateur | Runtime |
| Flexibilité | Stricte | Flexible |
| Apprentissage | Courbe | Plat |

---

## ✅ Checklist ES6

- [x] Service CRUD ES6 (`crud.js`)
- [x] Hooks React Query ES6 (`crud-hooks.js`)
- [x] Utils images ES6 (`image-utils.js`)
- [x] Composant PersonForm ES6 (`PersonForm.jsx`)
- [x] Exemples ES6 (`crud-examples.js`)
- [x] Barrel exports (`crud-index.js`)
- [x] JSDoc pour la documentation
- [x] Pas de TypeScript

🚀 **Tout est prêt pour utiliser ES6 pur!**
