import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          {values.photo ? <AvatarImage src={values.photo} alt="" /> : null}
          <AvatarFallback className="bg-primary/10 text-primary">{initials || "?"}</AvatarFallback>
        </Avatar>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Choisir une photo
          </Button>
          {errors.photo && <p className="mt-1 text-xs text-destructive">{errors.photo}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="firstName">Prénom</Label>
          <Input id="firstName" value={values.firstName} maxLength={50} onChange={(e) => set("firstName", e.target.value)} />
          {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>}
        </div>
        <div>
          <Label htmlFor="lastName">Nom</Label>
          <Input id="lastName" value={values.lastName} maxLength={50} onChange={(e) => set("lastName", e.target.value)} />
          {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="role">Fonction / Rôle</Label>
        <Input id="role" value={values.role} maxLength={80} onChange={(e) => set("role", e.target.value)} />
        {errors.role && <p className="mt-1 text-xs text-destructive">{errors.role}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={values.email} maxLength={255} onChange={(e) => set("email", e.target.value)} />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" value={values.phone ?? ""} maxLength={30} onChange={(e) => set("phone", e.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" rows={3} value={values.bio ?? ""} maxLength={500} onChange={(e) => set("bio", e.target.value)} />
        {errors.bio && <p className="mt-1 text-xs text-destructive">{errors.bio}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={submitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}
