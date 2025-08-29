// src/deep-scan.js
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceAccountPath = join(__dirname, '../serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deepScan() {
  console.log("--- INICIANDO ESCANEO PROFUNDO ---");
  const projectsRef = db.collection('projects');
  const projectsSnapshot = await projectsRef.get();

  if (projectsSnapshot.empty) {
    console.log("ERROR: No se encontró la colección 'projects'.");
    return;
  }

  console.log("Proyectos encontrados:", projectsSnapshot.size);

  for (const projectDoc of projectsSnapshot.docs) {
    console.log(`\n[Analizando Proyecto ID: ${projectDoc.id}]`);
    const usersRef = projectDoc.ref.collection('projectUsers');
    const usersSnapshot = await usersRef.get();

    if (usersSnapshot.empty) {
      console.log(`  -> ❌ No se encontraron documentos en la sub-colección 'projectUsers'.`);
    } else {
      console.log(`  -> ✅ Documentos encontrados en 'projectUsers':`);
      usersSnapshot.forEach(userDoc => {
        console.log(`    --- ID de Usuario: ${userDoc.id}, Rol: ${userDoc.data().role}`);
      });
    }
  }
  console.log("\n--- ESCANEO COMPLETO ---");
}

deepScan();