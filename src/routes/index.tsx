import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Mail, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
        toast.success("Profil mis à jour");
      } else {
        await trombiDB.create(values);
        toast.success("Profil ajouté");
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
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />

      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Trombinoscope</h1>
              <p className="text-sm text-muted-foreground">
                Annuaire dynamique — stocké localement dans votre navigateur
              </p>
            </div>
          </div>
          <Button onClick={openCreate} size="lg">
            <Plus className="mr-2 h-4 w-4" /> Ajouter une personne
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, rôle, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Badge variant="secondary" className="shrink-0">
            {filtered.length} {filtered.length > 1 ? "profils" : "profil"}
          </Badge>
        </div>

        {!loaded ? (
          <p className="py-16 text-center text-muted-foreground">Chargement...</p>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Users className="h-10 w-10 text-muted-foreground" />
              <h2 className="text-lg font-semibold">
                {people.length === 0 ? "Aucun profil pour l'instant" : "Aucun résultat"}
              </h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                {people.length === 0
                  ? "Commencez par ajouter votre premier profil au trombinoscope."
                  : "Essayez d'ajuster votre recherche."}
              </p>
              {people.length === 0 && (
                <Button onClick={openCreate} className="mt-2">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter une personne
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const initials = `${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`.toUpperCase();
              return (
                <Card
                  key={p.id}
                  className="group cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                  onClick={() => setViewing(p)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        {p.photo ? <AvatarImage src={p.photo} alt={`${p.firstName} ${p.lastName}`} /> : null}
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-foreground">
                          {p.firstName} {p.lastName}
                        </h3>
                        <p className="truncate text-sm text-muted-foreground">{p.role}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{p.email}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(p);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(p.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier le profil" : "Nouveau profil"}</DialogTitle>
            <DialogDescription>
              Renseignez vos informations. Elles sont sauvegardées dans votre navigateur.
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
                <DialogTitle>{viewing.firstName} {viewing.lastName}</DialogTitle>
                <DialogDescription>{viewing.role}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-2">
                <Avatar className="h-28 w-28">
                  {viewing.photo ? <AvatarImage src={viewing.photo} alt="" /> : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                    {`${viewing.firstName[0] ?? ""}${viewing.lastName[0] ?? ""}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="w-full space-y-2 text-sm">
                  <a href={`mailto:${viewing.email}`} className="flex items-center gap-2 text-foreground hover:text-primary">
                    <Mail className="h-4 w-4 text-muted-foreground" /> {viewing.email}
                  </a>
                  {viewing.phone && (
                    <a href={`tel:${viewing.phone}`} className="flex items-center gap-2 text-foreground hover:text-primary">
                      <Phone className="h-4 w-4 text-muted-foreground" /> {viewing.phone}
                    </a>
                  )}
                  {viewing.bio && (
                    <p className="mt-3 rounded-md bg-muted p-3 text-muted-foreground">{viewing.bio}</p>
                  )}
                </div>
                <div className="flex w-full justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { const p = viewing; setViewing(null); openEdit(p); }}>
                    <Pencil className="mr-2 h-4 w-4" /> Modifier
                  </Button>
                  <Button variant="destructive" onClick={() => setDeleteId(viewing.id)}>
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
            <AlertDialogTitle>Supprimer ce profil ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. Le profil sera retiré de votre trombinoscope.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
