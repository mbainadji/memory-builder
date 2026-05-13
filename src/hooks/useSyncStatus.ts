import { useEffect, useState, useCallback } from "react";
import { syncManager, type SyncStatus } from "@/lib/syncManager";

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>(syncManager.getStatus());

  useEffect(() => {
    // S'abonner aux mises à jour de statut
    const unsubscribe = syncManager.subscribe(setStatus);

    // Démarrer la synchronisation automatique
    syncManager.startAutoSync();

    return () => {
      unsubscribe();
      // Optionnel : arrêter la sync auto au démontage si nécessaire
      // syncManager.stopAutoSync();
    };
  }, []);

  const manualSync = useCallback(() => {
    syncManager.sync();
  }, []);

  return { ...status, manualSync };
}
