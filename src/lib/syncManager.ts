// Gestionnaire de synchronisation entre local et distant
import { Person, trombiDB } from "./trombiDB";

export interface SyncStatus {
  isSyncing: boolean;
  lastSync: number;
  pendingChanges: number;
  error: string | null;
}

const SYNC_INTERVAL = 30000; // 30 secondes
const API_URL = "/api";

let syncStatus: SyncStatus = {
  isSyncing: false,
  lastSync: 0,
  pendingChanges: 0,
  error: null,
};

let syncInterval: NodeJS.Timeout | null = null;
let syncListeners: Set<(status: SyncStatus) => void> = new Set();

// Fonction helper pour merger les données
async function mergeData(localData: Person[], remoteData: Person[]) {
  const remoteMap = new Map(remoteData.map((p) => [p.id, p]));

  for (const local of localData) {
    const remote = remoteMap.get(local.id);

    if (!remote) {
      await trombiDB.remove(local.id);
    } else if (remote.updatedAt > local.updatedAt) {
      await trombiDB.update(local.id, {
        firstName: remote.firstName,
        lastName: remote.lastName,
        role: remote.role,
        email: remote.email,
        phone: remote.phone,
        bio: remote.bio,
        photo: remote.photo,
      });
    }
    remoteMap.delete(local.id);
  }

  for (const [, remote] of remoteMap) {
    await trombiDB.create({
      firstName: remote.firstName,
      lastName: remote.lastName,
      role: remote.role,
      email: remote.email,
      phone: remote.phone,
      bio: remote.bio,
      photo: remote.photo,
    });
  }
}

function notifyListeners() {
  syncListeners.forEach((listener) => listener(syncStatus));
}

async function performSync() {
  if (syncStatus.isSyncing) return;

  syncStatus.isSyncing = true;
  syncStatus.error = null;
  notifyListeners();

  try {
    const localData = await trombiDB.list();
    const response = await fetch(`${API_URL}/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: localData }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const remoteData: Person[] = await response.json();
    await mergeData(localData, remoteData);

    syncStatus.lastSync = Date.now();
    syncStatus.pendingChanges = 0;
  } catch (error) {
    syncStatus.error = error instanceof Error ? error.message : "Sync failed";
    console.error("Sync error:", error);
  } finally {
    syncStatus.isSyncing = false;
    notifyListeners();
  }
}

export const syncManager = {
  subscribe(listener: (status: SyncStatus) => void) {
    syncListeners.add(listener);
    listener(syncStatus);
    return () => syncListeners.delete(listener);
  },

  getStatus(): SyncStatus {
    return { ...syncStatus };
  },

  async sync() {
    await performSync();
  },

  startAutoSync() {
    if (syncInterval) return;
    syncInterval = setInterval(() => performSync(), SYNC_INTERVAL);
    performSync();
  },

  stopAutoSync() {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  },

  markPending() {
    syncStatus.pendingChanges++;
    notifyListeners();
  },
};
