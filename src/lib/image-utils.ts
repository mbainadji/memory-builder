/**
 * Utilitaires pour la gestion des images
 * - Compression
 * - Optimisation taille
 * - Validation
 */

/**
 * Compresse une image en réduisant sa taille
 * @param file File à compresser
 * @param maxWidth Largeur max en pixels
 * @param maxHeight Hauteur max en pixels
 * @param quality Qualité JPEG (0-1)
 * @param maxSizeBytes Taille max en octets
 * @returns DataURL compressée
 */
export async function compressImage(
  file: File,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.8,
  maxSizeBytes = 500 * 1024, // 500 KB
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        // Créer un canvas
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Calculer les nouvelles dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dessiner et compresser
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Impossible de créer le contexte canvas");

        ctx.drawImage(img, 0, 0, width, height);

        // Réduire la qualité progressivement si nécessaire
        let currentQuality = quality;
        let dataURL = canvas.toDataURL("image/jpeg", currentQuality);

        // Si trop grande, réduire la qualité
        while (dataURL.length > maxSizeBytes && currentQuality > 0.1) {
          currentQuality -= 0.1;
          dataURL = canvas.toDataURL("image/jpeg", currentQuality);
        }

        // Vérifier la taille finale
        if (dataURL.length > maxSizeBytes) {
          reject(
            new Error(
              `Image encore trop grande (${(dataURL.length / 1024).toFixed(0)} KB). Essayez une image plus petite.`,
            ),
          );
        } else {
          resolve(dataURL);
        }
      };

      img.onerror = () => {
        reject(new Error("Impossible de charger l'image"));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Erreur lors de la lecture du fichier"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Valide et traite un fichier image
 * @param file Fichier à traiter
 * @returns DataURL compressée
 */
export async function processImageFile(file: File): Promise<string> {
  // Vérifier le type
  if (!file.type.startsWith("image/")) {
    throw new Error("Veuillez sélectionner une image");
  }

  // Vérifier la taille du fichier original
  const maxFileSizeBytes = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxFileSizeBytes) {
    throw new Error(
      `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.`,
    );
  }

  try {
    // Compresser l'image
    const compressed = await compressImage(file);
    return compressed;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Erreur lors de la compression");
  }
}

/**
 * Obtient les informations de l'image
 * @param dataURL DataURL de l'image
 * @returns Informations (taille, dimensions théoriques)
 */
export function getImageInfo(dataURL: string): {
  sizeKB: number;
  sizeDisplay: string;
} {
  const sizeBytes = dataURL.length;
  const sizeKB = Math.round(sizeBytes / 1024);
  const sizeDisplay = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

  return {
    sizeKB,
    sizeDisplay,
  };
}

/**
 * Nettoie et valide une URL d'image stockée
 * @param photo DataURL stockée
 * @returns true si valide
 */
export function isValidImageData(photo: string | undefined): boolean {
  if (!photo) return false;
  return photo.startsWith("data:image/");
}
