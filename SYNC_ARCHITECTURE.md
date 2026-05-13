# 🔄 Architecture Synchronisation - Trombinoscope

## 📋 Vue d'ensemble

Le Trombinoscope utilise une architecture **offline-first** avec synchronisation automatique entre une base de données locale et une base distante.

### Architecture

```
┌─────────────────────┐
│   Client Browser    │
│  ┌───────────────┐  │
│  │ SQLite (local)│  │ ← Stocké en localStorage
│  │  via sql.js   │  │
│  └───────────────┘  │
└──────────┬──────────┘
           │ 🔄 Auto-sync (30s)
           │ ou manuel
           ▼
┌─────────────────────┐
│   Backend API       │
│  ┌───────────────┐  │
│  │   /api/sync   │  │ ← Cloudflare Workers ou Node.js
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │  Database (D1)│  │ ← Ou PostgreSQL, MySQL, etc.
│  │ ou Memory     │  │
│  └───────────────┘  │
└─────────────────────┘
```

## 🔌 Composants

### 1. **Local Database** (`src/lib/trombiDB.ts`)
- SQLite via sql.js (WebAssembly)
- Persisté en localStorage
- Fonctionne offline
- Opérations synchrones sur les données locales

### 2. **Sync Manager** (`src/lib/syncManager.ts`)
- Gère la synchronisation automatique toutes les 30 secondes
- Merge avec gestion de conflits (Last-Write-Wins)
- Notifie les composants React du statut
- Support offline

### 3. **Hook React** (`src/hooks/useSyncStatus.ts`)
- `useSyncStatus()` - Accès au statut de sync
- Auto-démarrage de la sync au montage
- Mises à jour en temps réel

### 4. **API Endpoint** (`src/routes/api/sync.ts`)
- Endpoint POST `/api/sync`
- Reçoit les données du client
- Retourne les données du serveur
- Merge côté serveur

### 5. **Backend Storage** (`src/api/sync.ts`)
- Implémentation stockage serveur
- Actuellement: Map en mémoire
- À remplacer par: D1, PostgreSQL, MongoDB, etc.

## 🔄 Flux de Synchronisation

### Automatique (toutes les 30s)
1. Client envoie ses données locales
2. Serveur fusionne avec ses données
3. Serveur retourne l'état complet
4. Client fusionne avec ses données locales
5. État final = union des deux côtés

### Manuel
```typescript
const { manualSync } = useSyncStatus();
manualSync(); // Déclenche une sync immédiate
```

## ⚔️ Résolution de Conflits

**Stratégie**: Last-Write-Wins (LWW)

```typescript
if (remote.updatedAt > local.updatedAt) {
  // Le serveur gagne
  appliquer(remote);
} else {
  // Le client gagne
  appliquer(local);
}
```

## 💾 Implémentations Possibles

### Option 1: Cloudflare D1 (Production Recommandé)
```typescript
// env.d1.ts
export const DB = env.DB;

// Dans handleSync:
const result = await env.DB.prepare(
  'INSERT OR REPLACE INTO people VALUES (...)'
).run();
```

### Option 2: PostgreSQL/Supabase
```typescript
const { data, error } = await supabase
  .from('people')
  .upsert(clientData);
```

### Option 3: Firebase Realtime
```typescript
const ref = database.ref('people');
ref.update(clientData);
```

### Option 4: Backend Node.js Simple
```bash
npm install express prisma
```

```typescript
// server.js
app.post('/api/sync', async (req, res) => {
  const merged = await db.merge(req.body.data);
  res.json(merged);
});
```

## 📊 Statut de Synchronisation

```typescript
interface SyncStatus {
  isSyncing: boolean;      // Sync en cours
  lastSync: number;        // Timestamp de la dernière sync réussie
  pendingChanges: number;  // Changements en attente
  error: string | null;    // Message d'erreur s'il y a
}
```

## 🎯 Utilisation dans les Composants

```typescript
import { useSyncStatus } from '@/hooks/useSyncStatus';

function MyComponent() {
  const { isSyncing, lastSync, error, manualSync } = useSyncStatus();

  return (
    <>
      {isSyncing && <p>Synchronisation...</p>}
      {lastSync && <p>Dernière sync: {new Date(lastSync).toLocaleTimeString()}</p>}
      {error && <p style={{ color: 'red' }}>Erreur: {error}</p>}
      <button onClick={manualSync}>Synchroniser maintenant</button>
    </>
  );
}
```

## 🚀 Mise en Place

### 1. Configuration locale (déjà faite)
✅ SQLite avec sql.js  
✅ Sync Manager  
✅ Hook React  

### 2. Configuration backend
Choisir une option ci-dessus et l'implémenter dans `src/api/sync.ts`

### 3. Déploiement
```bash
# Test local
npm run dev

# Build
npm run build

# Déployer sur Cloudflare
wrangler deploy
```

## 🧪 Test de Synchronisation

### Scénario 1: Online
1. Ajouter/éditer/supprimer un profil
2. Vérifier que la sync s'exécute automatiquement
3. Vérifier l'icon 🟢 Cloud dans le header

### Scénario 2: Offline
1. Ouvrir DevTools → Network → Offline
2. Ajouter/éditer des profils
3. Reconnecter
4. Vérifier que tout se synchronise

### Scénario 3: Conflits
1. Client A modifie un profil (updatedAt = 100)
2. Client B modifie le même profil (updatedAt = 200)
3. Le client B gagne (LWW)

## 📈 Métriques de Performance

- **Temps de sync**: < 1s
- **Intervalle auto**: 30s
- **Stockage local**: ~100KB pour 1000 profils
- **Bande passante**: ~10KB par sync

## 🔒 Sécurité

À implémenter:
- ✅ CORS (ajouter si backend distant)
- ⚠️ Authentification (JWT, OAuth)
- ⚠️ Chiffrement des données sensibles
- ⚠️ Validation des données côté serveur
- ⚠️ Rate limiting

## 🐛 Dépannage

### "Sync failed"
1. Vérifier la connexion réseau
2. Vérifier les logs DevTools
3. Vérifier l'endpoint `/api/sync`

### Données pas synchronisées
1. Vérifier que `syncManager.startAutoSync()` est appelé
2. Vérifier les timestamps `updatedAt`
3. Vérifier la stratégie de merge

### Erreur CORS
1. Ajouter `mode: 'cors'` à la requête fetch
2. Configurer les headers CORS côté serveur

## 📚 Ressources

- [Offline-First Architecture](https://offlinefirst.org/)
- [Conflict-free Replicated Data Types (CRDTs)](https://crdt.tech/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [TanStack React Router](https://tanstack.com/router/latest)
