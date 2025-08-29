// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- La línea clave que faltaba o era incorrecta

// Tu configuración web de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD8k6ZbsdVFMqIPiZfxd5Jv32lBytek3C4",
  authDomain: "leadcontrolflow.firebaseapp.com",
  projectId: "leadcontrolflow",
  storageBucket: "leadcontrolflow.firebasestorage.app",
  messagingSenderId: "392243858821",
  appId: "1:392243858821:web:1bfffa4efe6150108348ec",
  measurementId: "G-D32HZW9EE6"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que usarás
export const auth = getAuth(app);
export const db = getFirestore(app); // <-- La línea 23 ahora funcionará

// Comentado para conectar a la base de datos real
// import { connectFirestoreEmulator } from "firebase/firestore";
// if (window.location.hostname === "localhost") {
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }