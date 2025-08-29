// src/PruebaBasica.jsx
import React from 'react';
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const PruebaBasica = () => {
  const leerDocumento = async () => {
    console.log("Intentando leer 'pruebas/testdoc'...");
    const docRef = doc(db, "pruebas", "testdoc");
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("✅ ¡ÉXITO! Datos del documento:", docSnap.data());
        alert(`¡ÉXITO! Se leyó el documento. Mensaje: ${docSnap.data().message}`);
      } else {
        console.log("❌ FALLO: No se encontró el documento.");
        alert("FALLO: El documento 'pruebas/testdoc' no fue encontrado.");
      }
    } catch (error) {
      console.error("🚨 ERROR:", error);
      alert(`ERROR al leer: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '50px' }}>
      <h1>Prueba de Lectura Fundamental</h1>
      <p>Esto intentará leer el documento '/pruebas/testdoc'.</p>
      <button onClick={leerDocumento} style={{ fontSize: '20px' }}>
        Leer Registro
      </button>
    </div>
  );
};

export default PruebaBasica;