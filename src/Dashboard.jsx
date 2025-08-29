// src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/></svg>;

const Dashboard = ({ user, onSelectLead, setActivePage }) => {
  const [leads, setLeads] = useState([]);
  const [userData, setUserData] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [advisersMap, setAdvisersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Open Leads');

  useEffect(() => {
    const fetchUserDataAndLeads = async () => {
      if (!user) { setLoading(false); return; }
      setLoading(true);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUserData(data);
          
          const userProjectId = data.projects?.[0];

          if (userProjectId) {
            const projectDocRef = doc(db, 'projects', userProjectId);
            const projectDocSnap = await getDoc(projectDocRef);
            if (projectDocSnap.exists()) {
              setProjectData(projectDocSnap.data());
            }

            const leadsCollectionRef = collection(db, 'projects', userProjectId, 'Client');
            let baseQuery;
            const userRole = data.role;

            if (userRole === 'admin' || userRole === 'internalSupervisor') {
              baseQuery = query(leadsCollectionRef);
            } else {
              baseQuery = query(leadsCollectionRef, where('adviserId', '==', user.uid));
            }

            let finalQuery;
            if (activeTab === 'Open Leads') {
              finalQuery = query(baseQuery, where('currentStatus', 'not-in', ['Successful Lead', 'Case Signed/Follow Up']));
            } else {
              finalQuery = query(baseQuery, where('currentStatus', 'in', ['Successful Lead', 'Case Signed/Follow Up']));
            }

            const leadsSnapshot = await getDocs(finalQuery);
            const leadsData = leadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLeads(leadsData);

            if (leadsData.length > 0) {
              const adviserIds = [...new Set(leadsData.map(lead => lead.adviserId).filter(Boolean))];
              if (adviserIds.length > 0) {
                  const usersPromises = adviserIds.map(id => getDoc(doc(db, 'users', id)));
                  const usersDocs = await Promise.all(usersPromises);
                  const newAdvisersMap = {};
                  usersDocs.forEach(userDoc => {
                    if (userDoc.exists()) {
                      newAdvisersMap[userDoc.id] = userDoc.data().name || userDoc.data().email;
                    }
                  });
                  setAdvisersMap(newAdvisersMap);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndLeads();
  }, [user, activeTab]);

  const handleRowClick = (leadId) => {
    const projectId = userData?.projects?.[0];
    if (projectId && onSelectLead) {
      onSelectLead({ leadId, projectId });
    }
  };

  const styles = {
    dashboard: { padding: '2rem' },
    header: { marginBottom: '2rem' },
    title: { fontSize: '2rem', fontWeight: '600', color: '#212529', margin: '0 0 0.5rem 0' },
    subtitle: { fontSize: '1rem', color: '#6c757d', margin: 0 },
    trackingCard: { backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    cardTitle: { fontSize: '1.25rem', fontWeight: '600', margin: 0 },
    newLeadButton: { backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    filters: { display: 'flex', gap: '1rem', marginBottom: '1.5rem' },
    searchInput: { display: 'flex', alignItems: 'center', backgroundColor: '#f1f3f5', border: '1px solid #dee2e6', borderRadius: '6px', padding: '0.5rem 0.75rem', flex: 1 },
    input: { border: 'none', backgroundColor: 'transparent', outline: 'none', marginLeft: '0.5rem', width: '100%' },
    datePicker: { display: 'flex', alignItems: 'center', backgroundColor: '#f1f3f5', border: '1px solid #dee2e6', borderRadius: '6px', padding: '0.5rem 0.75rem', cursor: 'pointer' },
    select: { backgroundColor: '#f1f3f5', border: '1px solid #dee2e6', borderRadius: '6px', padding: '0.5rem 0.75rem', minWidth: '200px' },
    tabs: { display: 'flex', borderBottom: '1px solid #dee2e6', marginBottom: '1rem' },
    tab: { padding: '0.75rem 1rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500', color: '#6c757d', borderBottom: '2px solid transparent' },
    activeTab: { color: '#4f46e5', borderBottom: '2px solid #4f46e5' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#6c757d', fontWeight: '600', textTransform: 'uppercase', borderBottom: '1px solid #dee2e6' },
    td: { padding: '1rem 1rem', fontSize: '0.875rem', color: '#212529', borderBottom: '1px solid #e9ecef' },
    statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500', backgroundColor: '#e9ecef', color: '#495057' },
  };

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>Viewing leads for all advisers.</p>
      </header>
      <div style={styles.trackingCard}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Lead Tracking</h2>
          <button style={styles.newLeadButton} onClick={() => setActivePage('New Lead')}>
            + New Lead
          </button>
        </div>
        <div style={styles.filters}>
          <div style={styles.searchInput}><SearchIcon /><input type="text" placeholder="Search by ID, name, or phone..." style={styles.input} /></div>
          <div style={styles.datePicker}><CalendarIcon /><span style={{marginLeft: '8px'}}>Aug 01, 2025 - Aug 31, 2025</span></div>
          <select style={styles.select}><option>All Advisers</option></select>
        </div>
        <div style={styles.tabs}>
          <button style={{...styles.tab, ...(activeTab === 'Open Leads' && styles.activeTab)}} onClick={() => setActiveTab('Open Leads')}>Open Leads</button>
          <button style={{...styles.tab, ...(activeTab === 'Successful Leads' && styles.activeTab)}} onClick={() => setActiveTab('Successful Leads')}>Successful Leads</button>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Internal ID</th>
              <th style={styles.th}>Client Name</th>
              <th style={styles.th}>Project</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Last Contact</th>
              <th style={styles.th}>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{...styles.td, textAlign: 'center'}}>Loading...</td></tr>
            ) : leads.length > 0 ? (
              leads.map(lead => (
                <tr key={lead.id} onClick={() => handleRowClick(lead.id)} style={{ cursor: 'pointer' }}>
                  <td style={styles.td}>{lead.humanReadableId || 'N/A'}</td>
                  <td style={styles.td}>{lead.clientInfo?.name || 'N/A'}</td>
                  <td style={styles.td}>{projectData?.projectName || 'General'}</td>
                  <td style={styles.td}><span style={styles.statusBadge}>{lead.currentStatus}</span></td>
                  <td style={styles.td}>{lead.updatedAt?.toDate().toLocaleDateString() || 'N/A'}</td>
                  <td style={styles.td}>{advisersMap[lead.adviserId] || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{...styles.td, textAlign: 'center'}}>No hay leads para mostrar.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;