import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import type { Person } from "@/lib/trombiDB";

export type PersonFormValues = Omit<Person, "id" | "createdAt" | "updatedAt">;

interface Props {
  initial?: Person;
  onSubmit: (values: PersonFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
}

const empty: PersonFormValues = {
  firstName: "",
  lastName: "",
  role: "",
  email: "",
  phone: "",
  bio: "",
  photo: "",
};

export function PersonForm({ initial, onSubmit, onCancel, submitLabel = "Enregistrer" }: Props) {
  const [values, setValues] = useState<PersonFormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = initial;
      setValues(rest);
    } else {
      setValues(empty);
    }
  }, [initial]);

  const set = <K extends keyof PersonFormValues>(k: K, v: PersonFormValues[K]) =>
    setValues((p) => ({ ...p, [k]: v }));

  const handlePhoto = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setErrors((e) => ({ ...e, photo: "Image trop grande (max 2 Mo)" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("photo", reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!values.firstName.trim()) e.firstName = "Requis";
    if (values.firstName.length > 50) e.firstName = "Max 50 caractères";
    if (!values.lastName.trim()) e.lastName = "Requis";
    if (values.lastName.length > 50) e.lastName = "Max 50 caractères";
    if (!values.role.trim()) e.role = "Requis";
    if (values.role.length > 80) e.role = "Max 80 caractères";
    if (!values.email.trim()) e.email = "Requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = "Email invalide";
    if (values.bio && values.bio.length > 500) e.bio = "Max 500 caractères";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        role: values.role.trim(),
        email: values.email.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const initials = `${values.firstName[0] ?? ""}${values.lastName[0] ?? ""}`.toUpperCase();
  const colors = ["from-blue-500 to-cyan-500", "from-purple-500 to-pink-500", "from-green-500 to-emerald-500"];
  const colorIndex = (values.firstName + values.lastName).charCodeAt(0) % colors.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo section */}
      <div className="flex justify-center">
        <div className="relative group">
          <Avatar className="h-28 w-28 border-4 border-blue-100 dark:border-blue-900 shadow-lg">
            {values.photo ? <AvatarImage src={values.photo} alt="" /> : null}
            <AvatarFallback className={`bg-gradient-to-br ${colors[colorIndex]} text-white text-2xl font-bold`}>
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors"
          >
            <Upload className="h-4 w-4" />
          </button>
          {values.photo && (
            <button
              type="button"
              onClick={() => set("photo", "")}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      {errors.photo && <p className="text-center text-sm text-red-600 dark:text-red-400">{errors.photo}</p>}

      {/* Nom et Prénom */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Prénom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            value={values.firstName}
            maxLength={50}
            placeholder="Jean"
            onChange={(e) => set("firstName", e.target.value)}
            className={`h-10 border-slate-200 dark:border-slate-800 ${
              errors.firstName ? "border-red-500 dark:border-red-500" : ""
            }`}
          />
          {errors.firstName && <p className="text-xs text-red-600 dark:text-red-400">{errors.firstName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            value={values.lastName}
            maxLength={50}
            placeholder="Dupont"
            onChange={(e) => set("lastName", e.target.value)}
            className={`h-10 border-slate-200 dark:border-slate-800 ${
              errors.lastName ? "border-red-500 dark:border-red-500" : ""
            }`}
          />
          {errors.lastName && <p className="text-xs text-red-600 dark:text-red-400">{errors.lastName}</p>}
        </div>
      </div>

      {/* Fonction / Rôle */}
      <div className="space-y-2">
        <Label htmlFor="role" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Fonction / Rôle <span className="text-red-500">*</span>
        </Label>
        <Input
          id="role"
          value={values.role}
          maxLength={80}
          placeholder="Directeur Général"
          onChange={(e) => set("role", e.target.value)}
          className={`h-10 border-slate-200 dark:border-slate-800 ${
            errors.role ? "border-red-500 dark:border-red-500" : ""
          }`}
        />
        {errors.role && <p className="text-xs text-red-600 dark:text-red-400">{errors.role}</p>}
      </div>

      {/* Email et Téléphone */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            maxLength={255}
            placeholder="jean@example.com"
            onChange={(e) => set("email", e.target.value)}
            className={`h-10 border-slate-200 dark:border-slate-800 ${
              errors.email ? "border-red-500 dark:border-red-500" : ""
            }`}
          />
          {errors.email && <p className="text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Téléphone
          </Label>
          <Input
            id="phone"
            value={values.phone ?? ""}
            maxLength={30}
            placeholder="+33 (0)1 23 45 67 89"
            onChange={(e) => set("phone", e.target.value)}
            className="h-10 border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Bio / Présentation
        </Label>
        <Textarea
          id="bio"
          rows={4}
          value={values.bio ?? ""}
          maxLength={500}
          placeholder="Écrivez quelques lignes à votre sujet..."
          onChange={(e) => set("bio", e.target.value)}
          className="border-slate-200 dark:border-slate-800 resize-none"
        />
        <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
          {values.bio?.length ?? 0}/500 caractères
        </div>
        {errors.bio && <p className="text-xs text-red-600 dark:text-red-400">{errors.bio}</p>}
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-6"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          {submitting ? "Traitement..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
