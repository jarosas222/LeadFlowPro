// src/DiagnosticoFinal.jsx
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const DiagnosticoFinal = ({ user }) => {

  // Verificación robusta: si no hay usuario o no tiene UID, no hacemos nada.
  if (!user || !user.uid) {
    return <p>Esperando información completa del usuario...</p>;
  }

  const testMyOwnRole = async () => {
    console.log(`Probando lectura para el UID de la sesión actual: ${user.uid}`);
    
    const docRef = doc(db, "users", user.uid); 

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        alert(`✅ ¡ÉXITO! Rol encontrado para ${user.email}: ${docSnap.data().role}`);
      } else {
        alert(`❌ FALLO: No se encontró el documento de rol para ${user.email} en la colección 'users'.`);
      }
    } catch (error) {
      alert(`🚨 ERROR: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h2>Panel de Diagnóstico Final</h2>
      <p>Usuario actual: <strong>{user.email}</strong></p>
      <p>Este botón intentará leer el documento de la colección <strong>users</strong> que corresponde a este mismo usuario.</p>
      <button onClick={testMyOwnRole} style={{ fontSize: '18px' }}>
        Probar Leer Mi Propio Rol
      </button>
    </div>
  );
};

export default DiagnosticoFinal;