// src/list-projects.js
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtenemos la ruta del archivo de forma segura
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceAccountPath = join(__dirname, '../serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listProjects() {
  console.log("Intentando listar todos los documentos en la colección 'projects'...");

  try {
    const projectsCollectionRef = db.collection('projects');
    const snapshot = await projectsCollectionRef.get();

    if (snapshot.empty) {
      console.log("❌ No se encontraron documentos en la colección 'projects'.");
      return;
    }

    console.log("✅ ¡Éxito! Proyectos encontrados:");
    snapshot.forEach(doc => {
      console.log("--- ID del Proyecto:", doc.id);
      if(doc.data().projectName) {
        console.log("    Nombre:", doc.data().projectName);
      }
    });

  } catch (error) {
    console.error("🚨 ERROR CATASTRÓFICO al intentar listar:", error.message);
  }
}

listProjects();