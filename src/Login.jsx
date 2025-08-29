// src/Login.jsx
import React, { useState } from 'react';

// Un componente de icono simple para el logo. Puedes reemplazarlo con tu propio SVG o imagen.
const LogoIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginBottom: '16px', color: '#4A5568' }}
  >
    <path
      d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M2 7L12 12L22 7"
      stroke="currentColor"
      strokeWidth="1.5"
    />
     <path
      d="M12 12L12 22"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M17 4.5L7 9.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const Login = ({ onLogin, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (onLogin) {
      onLogin(email, password);
    }
  };

  const styles = {
    // Este contenedor ahora ocupa toda la pantalla y centra el contenido.
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh', // Ocupa al menos el 100% del alto de la ventana
      width: '100%',
      backgroundColor: '#f0f2f5', // Un gris claro, como en la imagen de referencia
      fontFamily: 'sans-serif',
    },
    loginBox: {
      padding: '40px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      width: '380px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1a202c',
      margin: '0 0 8px 0',
    },
    subtitle: {
      fontSize: '14px',
      color: '#718096',
      marginBottom: '32px',
    },
    form: {
      textAlign: 'left',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#4a5568',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #cbd5e0',
      borderRadius: '6px',
      marginBottom: '20px',
      boxSizing: 'border-box',
      fontSize: '14px',
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'background-color 0.2s',
    },
    error: {
      color: '#e53e3e',
      fontSize: '14px',
      marginTop: '16px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <LogoIcon />
        <h1 style={styles.title}>LeadFlow</h1>
        <p style={styles.subtitle}>Please sign in to continue.</p>
        <form onSubmit={handleLogin} style={styles.form}>
          <label htmlFor="email" style={styles.label}>
            Email
          </label>
          <input
            type="email"
            id="email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password" style={styles.label}>
            Password
          </label>
          <input
            type="password"
            id="password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" style={styles.button}>
            <span style={{ marginRight: '8px', transform: 'translateY(-1px)' }}>→</span> Sign In
          </button>
        </form>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default Login;