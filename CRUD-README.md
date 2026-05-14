# 🚀 Service CRUD ES6

Un service CRUD complet et moderne en **ES6/ES2020+** pour gérer les personnes dans votre trombinoscope.

## 📋 Table des matières

- [Installation](#installation)
- [Opérations de base](#opérations-de-base)
- [Recherche et filtrage](#recherche-et-filtrage)
- [Pagination](#pagination)
- [Opérations avancées](#opérations-avancées)
- [Export/Import](#exportimport)
- [Exemples pratiques](#exemples-pratiques)

---

## 🔧 Installation

Le service CRUD est déjà intégré à votre projet. Importez-le simplement:

```typescript
import { crudService } from '@/lib/crud';
```

---

## 📚 Opérations de base

### CREATE - Créer une personne

```typescript
const newPerson = await crudService.create({
  firstName: 'Jean',
  lastName: 'Dupont',
  role: 'Développeur',
  email: 'jean.dupont@example.com',
  phone: '+33612345678',
  bio: 'Expert fullstack',
  photo: '', // optionnel: data URL
});

console.log(newPerson); // { id: '...', firstName: 'Jean', ..., createdAt: ..., updatedAt: ... }
```

### READ - Lire une personne

```typescript
// Par ID
const person = await crudService.getById('person-id-123');

// Toutes les personnes
const allPeople = await crudService.getAll();
```

### UPDATE - Mettre à jour une personne

```typescript
const updated = await crudService.update('person-id-123', {
  firstName: 'Jean-Marie',
  bio: 'Expert fullstack JavaScript',
  // Vous n'avez pas besoin de spécifier tous les champs
});
```

### DELETE - Supprimer une personne

```typescript
await crudService.delete('person-id-123');

// Supprimer plusieurs personnes
const count = await crudService.deleteMultiple(['id-1', 'id-2', 'id-3']);
console.log(`${count} personne(s) supprimée(s)`);
```

---

## 🔍 Recherche et filtrage

### Recherche textuelle

Cherche dans `firstName`, `lastName`, et `email`:

```typescript
const results = await crudService.search({
  search: 'Jean',
});
```

### Filtre par rôle

```typescript
const developers = await crudService.search({
  role: 'Développeur',
});
```

### Combinaison de filtres

```typescript
const results = await crudService.search({
  search: 'Marie',
  role: 'Designer',
});
```

---

## 📄 Pagination

Récupérez les données par pages:

```typescript
const result = await crudService.getPaginated(
  { page: 1, limit: 10 }, // Options de pagination
  { search: '', role: '' } // Options de filtrage (optionnel)
);

console.log(result);
// {
//   items: [...], // Personnes de cette page
//   total: 47,
//   page: 1,
//   limit: 10,
//   totalPages: 5
// }
```

### Pagination avec filtre

```typescript
const designersPage2 = await crudService.getPaginated(
  { page: 2, limit: 5 },
  { role: 'Designer' }
);
```

---

## 🎯 Opérations avancées

### UPSERT - Créer ou mettre à jour

```typescript
// Crée une nouvelle personne ou la met à jour si elle existe
const result = await crudService.upsert('person-id-or-undefined', {
  firstName: 'Marie',
  lastName: 'Dupont',
  role: 'Designer',
  email: 'marie.dupont@example.com',
});
```

### DUPLICATE - Dupliquer une personne

```typescript
const duplicate = await crudService.duplicate('person-id-123');
// Crée une nouvelle personne avec les mêmes données (mais nouvel ID)
```

### STATS - Obtenir les statistiques

```typescript
const stats = await crudService.getStats();
console.log(stats);
// {
//   total: 47,
//   byRole: {
//     'Développeur': 15,
//     'Designer': 8,
//     'Manager': 4,
//     ...
//   },
//   recentlyUpdated: [...]
// }
```

---

## 💾 Export/Import

### Exporter en JSON

```typescript
const jsonData = await crudService.exportJSON();

// Télécharger le fichier
const blob = new Blob([jsonData], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'people.json';
a.click();
```

### Importer depuis JSON

```typescript
const jsonString = '[ { "firstName": "...", "lastName": "...", ... } ]';
const count = await crudService.importJSON(jsonString);
console.log(`${count} personne(s) importée(s)`);
```

---

## 💡 Exemples pratiques

### Composant React avec CRUD

```typescript
import { useState, useEffect } from 'react';
import { crudService } from '@/lib/crud';
import type { Person } from '@/lib/trombiDB';

export function TrombinoscopePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Charger au montage
  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    setLoading(true);
    try {
      const data = await crudService.getAll();
      setPeople(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query.trim()) {
      loadPeople();
      return;
    }
    const results = await crudService.search({ search: query });
    setPeople(results);
  };

  const handleCreate = async (formData) => {
    try {
      const newPerson = await crudService.create(formData);
      setPeople([newPerson, ...people]);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleUpdate = async (id: string, formData) => {
    try {
      const updated = await crudService.update(id, formData);
      setPeople(people.map((p) => (p.id === id ? updated : p)));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await crudService.delete(id);
      setPeople(people.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {loading && <p>Chargement...</p>}
      {people.map((person) => (
        <div key={person.id}>
          <h3>{person.firstName} {person.lastName}</h3>
          <p>{person.role}</p>
          <button onClick={() => handleUpdate(person.id, { bio: 'Nouveau bio' })}>
            Modifier
          </button>
          <button onClick={() => handleDelete(person.id)}>Supprimer</button>
        </div>
      ))}
    </div>
  );
}
```

### Appels en série

```typescript
// 1. Créer une personne
const person = await crudService.create({
  firstName: 'Paul',
  lastName: 'Bernard',
  role: 'Manager',
  email: 'paul@example.com',
});

// 2. Mettre à jour
const updated = await crudService.update(person.id, {
  bio: 'Expérience en management agile',
});

// 3. Récupérer
const retrieved = await crudService.getById(person.id);

// 4. Supprimer
await crudService.delete(person.id);
```

### Batch operations

```typescript
// Créer plusieurs personnes
const people = [
  { firstName: 'Alice', lastName: 'A', role: 'Dev', email: 'alice@x.com' },
  { firstName: 'Bob', lastName: 'B', role: 'Dev', email: 'bob@x.com' },
  { firstName: 'Charlie', lastName: 'C', role: 'Design', email: 'charlie@x.com' },
];

for (const person of people) {
  await crudService.create(person);
}

// Supprimer plusieurs
const ids = ['id-1', 'id-2', 'id-3'];
const deletedCount = await crudService.deleteMultiple(ids);
```

---

## ⚠️ Gestion d'erreurs

```typescript
try {
  const person = await crudService.create({
    firstName: '', // ❌ Requis
    lastName: 'Dupont',
    role: 'Dev',
    email: 'invalid-email', // ❌ Email invalide
  });
} catch (error) {
  console.error('Erreur de validation:', error.message);
  // "firstName is required"
  // "Invalid email format"
}
```

---

## 🎓 Méthodes disponibles

| Méthode | Description | Paramètres | Retour |
|---------|-------------|-----------|--------|
| `create()` | Crée une personne | `PersonFormValues` | `Person` |
| `getById()` | Récupère une personne | `id: string` | `Person \| undefined` |
| `getAll()` | Liste toutes les personnes | - | `Person[]` |
| `search()` | Recherche et filtre | `FilterOptions` | `Person[]` |
| `getPaginated()` | Récupère les données paginées | `PaginationOptions`, `FilterOptions` | `PaginatedResult<Person>` |
| `update()` | Met à jour une personne | `id: string`, `data: Partial<PersonFormValues>` | `Person` |
| `delete()` | Supprime une personne | `id: string` | `void` |
| `deleteMultiple()` | Supprime plusieurs personnes | `ids: string[]` | `number` |
| `upsert()` | Crée ou met à jour | `id: string \| undefined`, `data: PersonFormValues` | `Person` |
| `duplicate()` | Duplique une personne | `id: string` | `Person` |
| `getStats()` | Obtient les statistiques | - | `{ total, byRole, recentlyUpdated }` |
| `exportJSON()` | Exporte en JSON | - | `string` |
| `importJSON()` | Importe depuis JSON | `jsonString: string` | `number` |

---

## 📞 Support

Pour plus d'exemples, voir le fichier `crud-examples.ts`.

Happy coding! 🎉
