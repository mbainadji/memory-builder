import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Mail, Phone, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { trombiDB, type Person } from "@/lib/trombiDB";
import { PersonForm, type PersonFormValues } from "@/components/PersonForm";


export const Route = createFileRoute("/")({
  component: TrombinoscopePage,
});

function TrombinoscopePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Person | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Person | null>(null);


  const refresh = async () => {
    const list = await trombiDB.list();
    setPeople(list.sort((a, b) => a.lastName.localeCompare(b.lastName)));
  };

  useEffect(() => {
    refresh().finally(() => setLoaded(true));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) =>
      [p.firstName, p.lastName, p.role, p.email].join(" ").toLowerCase().includes(q),
    );
  }, [people, search]);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (p: Person) => {
    setEditing(p);
    setFormOpen(true);
  };

  const handleSubmit = async (values: PersonFormValues) => {
    try {
      if (editing) {
        await trombiDB.update(editing.id, values);
        toast.success("Profil mis à jour avec succès");
      } else {
        await trombiDB.create(values);
        toast.success("Profil ajouté avec succès");
      }
      setFormOpen(false);
      setEditing(undefined);
      await refresh();
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement");
      console.error(e);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await trombiDB.remove(deleteId);
      toast.success("Profil supprimé");
      setDeleteId(null);
      if (viewing?.id === deleteId) setViewing(null);
      await refresh();
    } catch {
      toast.error("Suppression impossible");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <Toaster richColors position="top-right" />

      {/* Header avec gradient */}
      <header className="relative overflow-hidden border-b border-white/20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 backdrop-blur-sm">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -left-40 -bottom-40 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-lg">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Trombinoscope</h1>
                <p className="mt-1 text-blue-100">Gestionnaire d'annuaire professionnel</p>
              </div>
            </div>
            <Button 
              onClick={openCreate} 
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="mr-2 h-5 w-5" /> Ajouter une personne
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-12">
        {/* Status de synchronisation */}
        {syncStatus.error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Erreur de synchronisation: {syncStatus.error}</span>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Rechercher par nom, rôle, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-11 bg-white shadow-sm border-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="secondary" className="h-11 px-4 text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                {filtered.length} {filtered.length > 1 ? "profils" : "profil"}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={syncStatus.manualSync}
                disabled={syncStatus.isSyncing}
                title={syncStatus.isSyncing ? "Synchronisation en cours..." : "Synchroniser maintenant"}
                className="flex items-center gap-2"
              >
                {syncStatus.isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : syncStatus.lastSync ? (
                  <Cloud className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <CloudOff className="h-4 w-4 text-slate-400" />
                )}
                <span className="hidden sm:inline text-xs">
                  {syncStatus.isSyncing
                    ? "Sync..."
                    : syncStatus.lastSync
                    ? new Date(syncStatus.lastSync).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Non synchronisé"}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        {!loaded ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center animate-spin">
                <div className="h-8 w-8 rounded-full border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400"></div>
              </div>
              <p className="text-slate-600 dark:text-slate-400">Chargement de l'annuaire...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16">
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/50 backdrop-blur">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-4">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {people.length === 0 ? "Créez votre premier profil" : "Aucun résultat trouvé"}
                </h2>
                <p className="max-w-sm text-slate-600 dark:text-slate-400">
                  {people.length === 0
                    ? "Commencez à construire votre annuaire professionnel en ajoutant votre premier profil."
                    : "Ajustez votre recherche pour trouver les profils souhaités."}
                </p>
                {people.length === 0 && (
                  <Button onClick={openCreate} className="mt-4 bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Ajouter une personne
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => {
              const initials = `${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`.toUpperCase();
              const colors = ["from-blue-500 to-cyan-500", "from-purple-500 to-pink-500", "from-green-500 to-emerald-500", "from-orange-500 to-red-500"];
              const colorIndex = p.id.charCodeAt(0) % colors.length;
              return (
                <Card
                  key={p.id}
                  className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-800 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  onClick={() => setViewing(p)}
                >
                  {/* Gradient de fond en haut */}
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colors[colorIndex]}`}></div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-900 shadow-md">
                        {p.photo ? <AvatarImage src={p.photo} alt={`${p.firstName} ${p.lastName}`} /> : null}
                        <AvatarFallback className={`bg-gradient-to-br ${colors[colorIndex]} text-white font-bold text-lg`}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(p);
                          }}
                        >
                          <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(p.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-50 truncate">
                        {p.firstName} {p.lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Briefcase className="h-4 w-4 text-slate-400 dark:text-slate-600 flex-shrink-0" />
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{p.role}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <a 
                        href={`mailto:${p.email}`} 
                        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate text-xs">{p.email}</span>
                      </a>
                      {p.phone && (
                        <a 
                          href={`tel:${p.phone}`}
                          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="text-xs">{p.phone}</span>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Form dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(undefined); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editing ? "Modifier le profil" : "Nouveau profil"}</DialogTitle>
            <DialogDescription className="text-base">
              Renseignez vos informations. Elles sont sauvegardées localement dans votre navigateur.
            </DialogDescription>
          </DialogHeader>
          <PersonForm
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={() => { setFormOpen(false); setEditing(undefined); }}
            submitLabel={editing ? "Mettre à jour" : "Créer"}
          />
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-md">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{viewing.firstName} {viewing.lastName}</DialogTitle>
                <DialogDescription className="text-base flex items-center gap-2 mt-2">
                  <Briefcase className="h-4 w-4" />
                  {viewing.role}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-6 py-6">
                <Avatar className="h-32 w-32 border-4 border-blue-100 dark:border-blue-900 shadow-lg">
                  {viewing.photo ? <AvatarImage src={viewing.photo} alt="" /> : null}
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-4xl font-bold">
                    {`${viewing.firstName[0] ?? ""}${viewing.lastName[0] ?? ""}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="w-full space-y-3">
                  <a 
                    href={`mailto:${viewing.email}`} 
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <Mail className="h-5 w-5" /> 
                    <span className="text-sm break-all">{viewing.email}</span>
                  </a>
                  {viewing.phone && (
                    <a 
                      href={`tel:${viewing.phone}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      <Phone className="h-5 w-5" /> 
                      <span className="text-sm">{viewing.phone}</span>
                    </a>
                  )}
                  {viewing.bio && (
                    <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{viewing.bio}</p>
                    </div>
                  )}
                </div>
                <div className="flex w-full justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Button 
                    variant="outline" 
                    onClick={() => { const p = viewing; setViewing(null); openEdit(p); }}
                    className="flex-1 sm:flex-none"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Modifier
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setDeleteId(viewing.id)}
                    className="flex-1 sm:flex-none"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Supprimer ce profil ?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Cette action est définitive et ne peut pas être annulée. Le profil sera retiré de votre trombinoscope.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
