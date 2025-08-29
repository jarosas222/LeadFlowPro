// src/App.jsx
import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

import Login from './Login';
import Dashboard from './Dashboard';
import Sidebar from './Sidebar';
import NewLead from './NewLead';
import LeadDetail from './LeadDetail';
import Reports from './Reports'; // <-- Importamos el nuevo componente

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePage, setActivePage] = useState('Dashboard');
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, password) => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        setError('El correo electrónico o la contraseña son incorrectos.');
      } else {
        setError('Ocurrió un error al iniciar sesión.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  const handleSelectLead = (leadInfo) => {
    setSelectedLead(leadInfo);
    setActivePage('Lead Details');
  };
  
  const handleBackToDashboard = () => {
    setSelectedLead(null);
    setActivePage('Dashboard');
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard user={user} onSelectLead={handleSelectLead} setActivePage={setActivePage} />;
      case 'New Lead':
        return <NewLead user={user} setActivePage={setActivePage} />;
      case 'Lead Details':
        return <LeadDetail user={user} leadId={selectedLead.leadId} projectId={selectedLead.projectId} onBack={handleBackToDashboard} />;
      case 'Reports': // <-- Añadimos el caso para Reports
        return <Reports user={user} />;
      default:
        return <Dashboard user={user} onSelectLead={handleSelectLead} setActivePage={setActivePage} />;
    }
  };

  const styles = {
    mainLayout: { display: 'flex', backgroundColor: '#f8f9fa' },
    contentArea: { flex: 1, height: '100vh', overflowY: 'auto' },
    topHeader: { display: 'flex', justifyContent: 'flex-end', padding: '1rem 2rem', borderBottom: '1px solid #e9ecef', backgroundColor: '#ffffff' },
    logoutButton: { padding: '8px 16px', backgroundColor: '#4a5568', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      {user ? (
        <div style={styles.mainLayout}>
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
          <main style={styles.contentArea}>
            <div style={styles.topHeader}><button onClick={handleLogout} style={styles.logoutButton}>Cerrar Sesión</button></div>
            {renderActivePage()}
          </main>
        </div>
      ) : (
        <Login onLogin={handleLogin} error={error} />
      )}
    </>
  );
};

export default App;