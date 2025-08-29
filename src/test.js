// src/test.js
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8k6ZbsdVFMqIPiZfxd5Jv32lBytek3C4",
  authDomain: "leadcontrolflow.firebaseapp.com",
  projectId: "leadcontrolflow",
  storageBucket: "leadcontrolflow.firebasestorage.app",
  messagingSenderId: "392243858821",
  appId: "1:392243858821:web:1bfffa4efe6150108348ec",
  measurementId: "G-D32HZW9EE6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirestoreRead() {
  console.log("Iniciando prueba de lectura directa...");

  const projectId = "Xssl0zqKYG1kizVG9Hgw";
  const adminUid = "GYF1vdS2cJQ9TGMf325gsjHXwSD2";
  const docPath = `projects/${projectId}/projectUsers/${adminUid}`;

  console.log("Intentando leer la ruta:", docPath);

  const docRef = doc(db, 'projects', projectId, 'projectUsers', adminUid);

  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("✅ ¡ÉXITO! Documento encontrado:", docSnap.data());
    } else {
      console.log("❌ FALLO: El documento NO se encontró en esa ruta.");
    }
  } catch (error) {
    console.error("🚨 ERROR CATASTRÓFICO:", error.message);
  }
}

testFirestoreRead();