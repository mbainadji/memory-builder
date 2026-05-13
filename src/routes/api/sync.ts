// API Route pour la synchronisation
import type { Person } from "@/lib/trombiDB";
import { handleSync, loadMockData } from "@/api/sync";

// Initialiser les données mock au démarrage
loadMockData();

export async function POST(req: Request) {
  try {
    const { data } = await req.json() as { data: Person[] };

    if (!Array.isArray(data)) {
      return new Response(JSON.stringify({ error: "Invalid data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Synchroniser et retourner les données du serveur
    const serverData = await handleSync(data);

    return new Response(JSON.stringify(serverData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Sync API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  runtime: "nodejs",
};
