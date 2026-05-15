# 🖼️ Correction du problème avec les images

## ❌ Problème identifié

**Erreur lors de l'enregistrement avec une image** - Cela venait de plusieurs facteurs:

### 1. **Taille de l'image en base64**

- Une image JPEG de 2 MB en base64 devient ~2.66 MB (surcharge de 33%)
- Cela dépassait les limites de localStorage et SQLite
- Causait un débordement de buffer lors de l'enregistrement

### 2. **Pas de compression**

- Les images n'étaient pas redimensionnées
- Pas de réduction de qualité
- Pas de limite de taille maximale

### 3. **Pas de feedback utilisateur**

- L'erreur n'était pas claire
- Pas de message explicatif

---

## ✅ Solution appliquée

### 1. **Nouveau module `image-utils.ts`**

```typescript
import { processImageFile } from "@/lib/image-utils";

// Automatiquement:
// ✅ Valide le format (doit être une image)
// ✅ Redimensionne (max 400x400px)
// ✅ Compresse (réduction qualité progressive)
// ✅ Limite la taille finale (max 500 KB)
const compressed = await processImageFile(file);
```

**Paramètres de compression:**

- **Dimensions:** max 400x400 pixels
- **Qualité:** jusqu'à 80% (réduite si nécessaire)
- **Taille max:** 500 KB encodée (avant: illimitée)

### 2. **Mise à jour du formulaire `PersonForm.tsx`**

**Avant:**

```typescript
const handlePhoto = (file: File) => {
  if (file.size > 2 * 1024 * 1024) {
    setErrors((e) => ({ ...e, photo: "Image trop grande (max 2 Mo)" }));
    return;
  }
  const reader = new FileReader();
  reader.onload = () => set("photo", reader.result as string);
  reader.readAsDataURL(file);
};
```

**Après:**

```typescript
const handlePhoto = async (file: File) => {
  setErrors((e) => ({ ...e, photo: "" }));
  try {
    const compressed = await processImageFile(file);
    const info = getImageInfo(compressed);
    set("photo", compressed);
    toast.success(`Image compressée (${info.sizeDisplay})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    setErrors((e) => ({ ...e, photo: message }));
    toast.error(message);
  }
};
```

**Améliorations:**

- ✅ Compression automatique
- ✅ Messages d'erreur clairs
- ✅ Feedback utilisateur (toast)
- ✅ Affichage de la taille compressée

### 3. **Validation renforcée dans le CRUD**

Ajout de vérification de taille dans `crud.ts`:

```typescript
// Validation photo - vérifier la taille
if (data.photo) {
  if (data.photo.length > 1 * 1024 * 1024) {
    throw new Error("Photo too large (max 1 MB encoded)");
  }
}
```

### 4. **Meilleure gestion des erreurs**

**Avant:**

```typescript
catch (e) {
  toast.error("Erreur lors de l'enregistrement");
}
```

**Après:**

```typescript
catch (e) {
  const message = e instanceof Error ? e.message : "Erreur lors de l'enregistrement";
  toast.error(message);
}
```

---

## 📊 Comparaison avant/après

| Aspect                 | Avant             | Après                          |
| ---------------------- | ----------------- | ------------------------------ |
| **Taille max fichier** | 2 MB              | 5 MB (réduit à ~500 KB encodé) |
| **Taille max encodée** | Illimitée         | 1 MB (validation CRUD)         |
| **Compression**        | Non               | Oui (progressive)              |
| **Dimensions**         | Originales        | Max 400x400 px                 |
| **Feedback**           | Message générique | Messages spécifiques           |
| **Toasts**             | Non               | Oui                            |

---

## 🚀 Utilisation

### Charger une image dans le formulaire

```typescript
// Le formulaire gère automatiquement:
// 1. Sélection du fichier
// 2. Validation du format
// 3. Compression
// 4. Affichage du feedback

<input
  type="file"
  accept="image/*"
  onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])}
/>
```

### Utiliser directement (sans formulaire)

```typescript
import { processImageFile, getImageInfo } from "@/lib/image-utils";

try {
  const compressed = await processImageFile(file);
  const info = getImageInfo(compressed);
  console.log(`Taille: ${info.sizeDisplay}`);
} catch (error) {
  console.error(error.message);
}
```

---

## 🔧 Personnalisation

Si vous voulez modifier les paramètres de compression, éditez `image-utils.ts`:

```typescript
export async function processImageFile(file: File): Promise<string> {
  return compressImage(
    file,
    400, // ← maxWidth (changer ici)
    400, // ← maxHeight (changer ici)
    0.8, // ← quality (changer ici)
    500 * 1024, // ← maxSizeBytes (changer ici pour 1MB = 1024*1024)
  );
}
```

---

## ✅ Tests

Essayez maintenant:

1. ✅ Créer une personne avec une image (200KB)
2. ✅ Modifier avec une autre image
3. ✅ Charger une grosse image (5MB) → doit être compressée automatiquement
4. ✅ Les messages d'erreur doivent être clairs

---

## 📝 Fichiers modifiés

- `src/lib/image-utils.ts` (nouveau)
- `src/components/PersonForm.tsx` (handlePhoto amélioré)
- `src/lib/crud.ts` (validation photo ajoutée)
- `src/routes/index.tsx` (gestion erreurs améliorée)

---

## 💡 Notes techniques

**Pourquoi Canvas + JPEG?**

- Canvas permet de redimensionner
- JPEG est plus compact que PNG
- Qualité progressive pour adapter la taille

**localStorage vs SQLite?**

- Images compressées → localStorage OK
- LocalStorage ~5-10 MB limite
- SQLite peut gérer 1 MB par enregistrement

**Pourquoi 500 KB?**

- Compromis entre qualité et taille
- Pas de problème localStorage/SQLite
- Temps de chargement acceptable
