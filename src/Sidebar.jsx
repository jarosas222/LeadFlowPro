// src/Sidebar.jsx
import React from 'react';

// --- Iconos ---
const DashboardIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const NewLeadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>;
const ReportsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20V14"></path></svg>;
const DataIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

const Sidebar = ({ activePage, setActivePage }) => {
  const styles = {
    sidebar: { width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e9ecef', display: 'flex', flexDirection: 'column', height: '100vh', padding: '1.5rem 1rem', boxSizing: 'border-box' },
    logo: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2.5rem', padding: '0 0.5rem' },
    nav: { flexGrow: 1 },
    navItem: { display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '0.5rem', textDecoration: 'none', color: '#495057', fontWeight: '500', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', width: '100%', textAlign: 'left', fontSize: '1rem' },
    activeNavItem: { backgroundColor: '#f1f3f5', color: '#212529' },
    navIcon: { marginRight: '1rem' },
  };

  const menuItems = [
    { icon: <DashboardIcon />, text: 'Dashboard' },
    { icon: <NewLeadIcon />, text: 'New Lead' },
    { icon: <ReportsIcon />, text: 'Reports' },
    { icon: <DataIcon />, text: 'Data Management' },
    { icon: <SettingsIcon />, text: 'Settings' },
  ];

  return (
    <div style={styles.sidebar}>
      <h1 style={styles.logo}>LeadFlow</h1>
      <nav style={styles.nav}>
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setActivePage(item.text)}
            style={{
              ...styles.navItem,
              ...(activePage === item.text ? styles.activeNavItem : {}),
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {item.text}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;