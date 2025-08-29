// src/admin-test.js
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceAccountPath = join(__dirname, '../serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

// Especificamos explícitamente el proyecto
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "leadcontrolflow",
  databaseURL: "https://leadcontrolflow.firebaseio.com" // Esta URL es correcta
});

const db = admin.firestore();

async function testAdminRead() {
  console.log("Iniciando prueba de lectura como ADMINISTRADOR...");

  const projectId = "Xssl0zqKYG1kizVG9Hgw";
  const adminUid = "GYF1vdS2cJQ9TGMf325gsjHXwSD2";
  const docPath = `projects/${projectId}/projectUsers/${adminUid}`;

  console.log("Intentando leer la ruta:", docPath);
  const docRef = db.collection('projects').doc(projectId).collection('projectUsers').doc(adminUid);

  try {
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      console.log("✅ ¡ÉXITO! Documento encontrado:", docSnap.data());
    } else {
      console.log("❌ FALLO: El documento NO se encontró en esa ruta.");
    }
  } catch (error) {
    console.error("🚨 ERROR CATASTRÓFICO:", error.message);
  }
}

testAdminRead();