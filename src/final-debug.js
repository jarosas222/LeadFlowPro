// src/final-debug.js
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

async function listProjectUsers() {
  const projectId = "Xssl0zqKYG1kizVG9Hgw"; // Sabemos que este ID es correcto
  console.log(`Intentando listar documentos en la sub-colección 'projectUsers' del proyecto ${projectId}...`);

  try {
    const usersCollectionRef = db.collection('projects').doc(projectId).collection('projectUsers');
    const snapshot = await usersCollectionRef.get();

    if (snapshot.empty) {
      console.log("❌ La sub-colección 'projectUsers' está vacía o no se encontró.");
      return;
    }

    console.log("✅ ¡Éxito! Documentos encontrados en 'projectUsers':");
    snapshot.forEach(doc => {
      console.log("--- ID del Documento:", doc.id);
      console.log("    Contenido:", doc.data());
    });

  } catch (error) {
    console.error("🚨 ERROR CATASTRÓFICO al intentar listar:", error.message);
  }
}

listProjectUsers();