// src/Diagnostico.jsx
import React from 'react';
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const Diagnostico = () => {
  const testAdminRole = async () => {
    const adminUid = "GYF1vdS2cJQ9TGMf325gsjHXwSD2";
    console.log(`Probando lectura para admin UID: ${adminUid}`);
    // CORRECCIÓN: Apuntamos a la colección 'users'
    const docRef = doc(db, "users", adminUid); 
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        alert(`ÉXITO ADMIN: Rol encontrado -> ${docSnap.data().role}`);
      } else {
        alert("FALLO ADMIN: No se encontró el documento de rol en 'users'.");
      }
    } catch (error) {
      alert(`ERROR ADMIN: ${error.message}`);
    }
  };

  const testAdviserRole = async () => {
    const adviserUid = "oapfIZgtV8acYK1KW6gWzup9kmu1";
    console.log(`Probando lectura para adviser UID: ${adviserUid}`);
    // CORRECCIÓN: Apuntamos a la colección 'users'
    const docRef = doc(db, "users", adviserUid); 
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        alert(`ÉXITO ADVISER: Rol encontrado -> ${docSnap.data().role}`);
      } else {
        alert("FALLO ADVISER: No se encontró el documento de rol en 'users'.");
      }
    } catch (error) {
      alert(`ERROR ADVISER: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h2>Panel de Diagnóstico</h2>
      <p>Estos botones intentarán leer los documentos de la colección <strong>users</strong>.</p>
      <button onClick={testAdminRole} style={{ fontSize: '18px' }}>Probar Lectura de Rol Admin</button>
      <button onClick={testAdviserRole} style={{ fontSize: '18px' }}>Probar Lectura de Rol Adviser</button>
    </div>
  );
};

export default Diagnostico;