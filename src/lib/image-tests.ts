/**
 * Tests pour la compression d'images
 * Exécutez dans la console du navigateur
 */

import { compressImage, processImageFile, getImageInfo } from "./image-utils";

/**
 * Test de compression d'image
 */
export async function testImageCompression() {
  console.log("🧪 Test de compression d'image\n");

  // Créer une image test (carrée blanche)
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1000;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas error");

  // Remplir de blanc
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 1000, 1000);

  // Ajouter du texte
  ctx.fillStyle = "black";
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";
  ctx.fillText("TEST IMAGE 1000x1000", 500, 500);

  // Convertir en blob
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9);
  });

  console.log("📦 Image test créée:");
  console.log(`   Format: ${blob.type}`);
  console.log(`   Taille: ${(blob.size / 1024).toFixed(1)} KB`);
  console.log(`   Dimensions: 1000x1000\n`);

  // Convertir en File
  const file = new File([blob], "test.jpg", { type: blob.type });

  try {
    console.log("🔄 Compression en cours...\n");
    const compressed = await processImageFile(file);

    const info = getImageInfo(compressed);
    console.log("✅ Compression réussie:");
    console.log(`   Taille compressée: ${info.sizeDisplay}`);
    console.log(`   Avant: ${(blob.size / 1024).toFixed(1)} KB`);
    console.log(`   Après: ${info.sizeKB} KB`);
    console.log(`   Réduction: ${(100 - (info.sizeKB / (blob.size / 1024)) * 100).toFixed(1)}%\n`);

    // Afficher l'image compressée
    const img = document.createElement("img");
    img.src = compressed;
    img.style.maxWidth = "200px";
    img.style.border = "1px solid #ccc";
    document.body.appendChild(img);

    console.log("✅ Image affichée ci-dessus");
  } catch (error) {
    console.error("❌ Erreur:", error instanceof Error ? error.message : error);
  }
}

/**
 * Test d'erreurs de compression
 */
export async function testImageCompressionErrors() {
  console.log("🧪 Test des erreurs de compression\n");

  // Test 1: Fichier trop volumineux
  console.log("Test 1: Fichier > 5 MB");
  const largeBlob = new Blob(["x".repeat(6 * 1024 * 1024)], { type: "image/jpeg" });
  const largeFile = new File([largeBlob], "large.jpg", { type: "image/jpeg" });

  try {
    await processImageFile(largeFile);
    console.log("❌ Devrait avoir levé une erreur");
  } catch (error) {
    console.log(`✅ Erreur capturée: ${(error as Error).message}`);
  }

  console.log("");

  // Test 2: Format invalide
  console.log("Test 2: Format non-image");
  const textFile = new File(["This is not an image"], "text.txt", { type: "text/plain" });

  try {
    await processImageFile(textFile);
    console.log("❌ Devrait avoir levé une erreur");
  } catch (error) {
    console.log(`✅ Erreur capturée: ${(error as Error).message}`);
  }

  console.log("");
}

/**
 * Test performance
 */
export async function testImageCompressionPerformance() {
  console.log("🧪 Test de performance\n");

  // Créer une image test
  const canvas = document.createElement("canvas");
  canvas.width = 2000;
  canvas.height = 2000;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas error");

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 2000, 2000);

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9);
  });

  const file = new File([blob], "test.jpg", { type: blob.type });

  console.log(`Image test: ${(blob.size / 1024 / 1024).toFixed(2)} MB\n`);

  const iterations = 5;
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await processImageFile(file);
    const duration = performance.now() - start;
    times.push(duration);
    console.log(`  Itération ${i + 1}: ${duration.toFixed(0)}ms`);
  }

  const avg = times.reduce((a, b) => a + b) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log(`\n📊 Résultats:`);
  console.log(`   Moyenne: ${avg.toFixed(0)}ms`);
  console.log(`   Min: ${min.toFixed(0)}ms`);
  console.log(`   Max: ${max.toFixed(0)}ms`);
}

/**
 * Lance tous les tests
 */
export async function runAllImageTests() {
  try {
    await testImageCompression();
    console.log("\n" + "=".repeat(50) + "\n");

    await testImageCompressionErrors();
    console.log("\n" + "=".repeat(50) + "\n");

    await testImageCompressionPerformance();
  } catch (error) {
    console.error("❌ Erreur fatale:", error);
  }
}

// ============================================================================
// UTILISATION DANS LA CONSOLE DU NAVIGATEUR
// ============================================================================

/**
 * Importer et utiliser:
 *
 * 1. Dans la console du navigateur:
 *    import { testImageCompression } from '@/lib/image-tests.ts'
 *    await testImageCompression()
 *
 * 2. Ou tous les tests:
 *    import { runAllImageTests } from '@/lib/image-tests.ts'
 *    await runAllImageTests()
 */
