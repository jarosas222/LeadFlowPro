// src/Reports.jsx
import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

// Paleta de colores para los gráficos
const barColors = [
  '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', 
  '#8b5cf6', '#ec4899', '#6366f1', '#f97316', '#22c55e'
];

const Reports = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [advisers, setAdvisers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [sources, setSources] = useState([]);
  const [lawOffices, setLawOffices] = useState([]);
  
  const [filters, setFilters] = useState({
    project: '',
    searchId: '',
    startDate: '',
    endDate: '',
    adviser: 'all',
    status: 'all',
    source: 'all',
    lawOffice: 'all'
  });

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // --- State for Charts ---
  const [stateDistribution, setStateDistribution] = useState([]);
  const [cityDistribution, setCityDistribution] = useState([]);
  const [selectedState, setSelectedState] = useState(null);


  // Cargar proyectos del usuario
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!user?.uid) return;
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userProjectIds = userDocSnap.data().projects || [];
        if (userProjectIds.length > 0) {
          const projectsQuery = query(collection(db, 'projects'), where('__name__', 'in', userProjectIds));
          const projectsSnapshot = await getDocs(projectsQuery);
          const projectsData = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProjects(projectsData);
        }
      }
    };
    fetchUserProjects();
  }, [user]);

  // Cargar opciones cuando se selecciona un proyecto
  useEffect(() => {
    const fetchOptions = async () => {
        if (!filters.project) return;

        const projectRef = doc(db, 'projects', filters.project);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
            const projectData = projectSnap.data();
            setStatuses(projectData.projectConfig?.leadStatusOptions || []);
        }

        const advisersRef = collection(db, 'users');
        const sourcesRef = collection(db, 'projects', filters.project, 'leadSources');
        const officesRef = collection(db, 'projects', filters.project, 'lawOffices');

        const [advisersSnap, sourcesSnap, officesSnap] = await Promise.all([
            getDocs(query(advisersRef, where('role', '==', 'adviser'))),
            getDocs(sourcesRef),
            getDocs(officesRef)
        ]);
        
        setAdvisers(advisersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setSources(sourcesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLawOffices(officesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchOptions();
  }, [filters.project]);


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    if (!filters.project) {
        alert("Please select a project first.");
        return;
    }
    setLoading(true);
    setSearched(true);
    setSelectedState(null); // Reset chart selection

    let leadsQuery = query(collection(db, 'projects', filters.project, 'Client'));

    if (filters.adviser !== 'all') {
        leadsQuery = query(leadsQuery, where('adviserId', '==', filters.adviser));
    }
    if (filters.status !== 'all') {
        leadsQuery = query(leadsQuery, where('currentStatus', '==', filters.status));
    }
    if (filters.source !== 'all') {
        leadsQuery = query(leadsQuery, where('leadSource', '==', filters.source));
    }
    if (filters.lawOffice !== 'all') {
        leadsQuery = query(leadsQuery, where('lawOffice', '==', filters.lawOffice));
    }
    if (filters.startDate) {
        leadsQuery = query(leadsQuery, where('createdAt', '>=', new Date(filters.startDate)));
    }
    if (filters.endDate) {
        leadsQuery = query(leadsQuery, where('createdAt', '<=', new Date(filters.endDate + 'T23:59:59')));
    }
    
    const querySnapshot = await getDocs(leadsQuery);
    let leadsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (filters.searchId) {
        const searchTerm = filters.searchId.toLowerCase();
        leadsData = leadsData.filter(lead => 
            lead.humanReadableId?.toLowerCase().includes(searchTerm) ||
            lead.clientInfo?.name?.toLowerCase().includes(searchTerm) ||
            lead.clientInfo?.phone?.toLowerCase().includes(searchTerm)
        );
    }
    
    setSearchResults(leadsData);
    calculateDistributions(leadsData);
    setLoading(false);
  };

  const calculateDistributions = (leads) => {
    const stateCounts = leads.reduce((acc, lead) => {
        const state = lead.clientInfo?.state;
        if (state) {
            acc[state] = (acc[state] || 0) + 1;
        }
        return acc;
    }, {});
    
    const stateData = Object.entries(stateCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    
    setStateDistribution(stateData);
  };

  const handleStateClick = (stateName) => {
    setSelectedState(stateName);
    const leadsInState = searchResults.filter(lead => lead.clientInfo?.state === stateName);
    
    const cityCounts = leadsInState.reduce((acc, lead) => {
        const city = lead.clientInfo?.city;
        if (city) {
            acc[city] = (acc[city] || 0) + 1;
        }
        return acc;
    }, {});

    const cityData = Object.entries(cityCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    setCityDistribution(cityData);
  };

  // --- Reusable Bar Chart Component ---
  const BarChart = ({ title, data, onBarClick }) => {
    const maxValue = data.length > 0 ? Math.max(...data.map(d => d.count)) : 0;
    return (
        <div>
            <h3 style={styles.chartTitle}>{title}</h3>
            {data.length > 0 ? (
                <div style={styles.chartContainer}>
                    {data.map((item, index) => (
                        <div key={item.name} style={styles.barRow} onClick={() => onBarClick && onBarClick(item.name)}>
                            <span style={styles.barLabel}>{item.name}</span>
                            <div style={styles.barWrapper}>
                                <div style={{
                                    ...styles.bar,
                                    backgroundColor: barColors[index % barColors.length],
                                    width: maxValue > 0 ? `${(item.count / maxValue) * 100}%` : '0%',
                                    cursor: onBarClick ? 'pointer' : 'default'
                                }}>
                                    <span style={styles.barCount}>{item.count}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={styles.noDataText}>No location data available for the current filter.</p>
            )}
        </div>
    );
  };

  const styles = {
      container: { fontFamily: 'sans-serif', padding: '2rem' },
      card: { backgroundColor: '#fff', borderRadius: '8px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
      header: { borderBottom: '1px solid #e9ecef', paddingBottom: '1rem', marginBottom: '2rem' },
      title: { fontSize: '2rem', fontWeight: '600', margin: '0 0 0.5rem 0' },
      subtitle: { color: '#6c757d' },
      filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' },
      input: { width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '4px' },
      select: { width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '4px' },
      dateContainer: { display: 'flex', gap: '0.5rem' },
      button: { backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: '500' },
      table: { width: '100%', borderCollapse: 'collapse', marginTop: '2rem' },
      th: { borderBottom: '2px solid #dee2e6', padding: '1rem', textAlign: 'left', color: '#495057' },
      td: { borderBottom: '1px solid #dee2e6', padding: '1rem', color: '#212529' },
      noResults: { textAlign: 'center', padding: '2rem', color: '#6c757d' },
      // Chart Styles
      chartTitle: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' },
      chartContainer: { display: 'flex', flexDirection: 'column', gap: '1rem' },
      barRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
      barLabel: { width: '150px', textAlign: 'right', color: '#495057', fontSize: '0.9rem', flexShrink: 0 },
      barWrapper: { flexGrow: 1, backgroundColor: '#e9ecef', borderRadius: '4px' },
      bar: { height: '24px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: 'white', paddingRight: '0.5rem', transition: 'width 0.3s ease-in-out' },
      barCount: { fontSize: '0.8rem', fontWeight: '500' },
      noDataText: { color: '#6c757d', textAlign: 'center', padding: '2rem' },
      backButton: { background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: '500', marginBottom: '1rem' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Reports</h1>
        <p style={styles.subtitle}>Filter and analyze lead data for all advisers.</p>
      </div>

      <div style={styles.card}>
        <h2 style={styles.chartTitle}>Detailed Lead Analysis</h2>
        <div style={styles.filterGrid}>
          {/* Project Filter */}
          <select name="project" value={filters.project} onChange={handleFilterChange} style={styles.select}>
            <option value="">Select a Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
          </select>
          
          {/* Search by ID/Name/Phone */}
          <input type="text" name="searchId" placeholder="Search by ID, name, or phone" value={filters.searchId} onChange={handleFilterChange} style={styles.input} />

          {/* Date Range Filter */}
          <div style={styles.dateContainer}>
             <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} style={styles.input} />
             <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} style={styles.input} />
          </div>
          
          {/* Adviser Filter */}
          <select name="adviser" value={filters.adviser} onChange={handleFilterChange} style={styles.select} disabled={!filters.project}>
            <option value="all">All Advisers</option>
            {advisers.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          {/* Status Filter */}
          <select name="status" value={filters.status} onChange={handleFilterChange} style={styles.select} disabled={!filters.project}>
            <option value="all">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Source Filter */}
          <select name="source" value={filters.source} onChange={handleFilterChange} style={styles.select} disabled={!filters.project}>
            <option value="all">All Sources</option>
            {sources.map(s => <option key={s.id} value={s.sourceName}>{s.sourceName}</option>)}
          </select>

          {/* Law Office Filter */}
          <select name="lawOffice" value={filters.lawOffice} onChange={handleFilterChange} style={styles.select} disabled={!filters.project}>
            <option value="all">All Law Offices</option>
            {lawOffices.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
          </select>

          <button onClick={handleSearch} style={styles.button} disabled={loading}>{loading ? 'Searching...' : 'Apply Filters'}</button>
        </div>
        
        <table style={styles.table}>
            <thead>
                <tr>
                    <th style={styles.th}>Source ID</th>
                    <th style={styles.th}>Client Name</th>
                    <th style={styles.th}>Project</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Last Contact</th>
                    <th style={styles.th}>Assigned To</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr><td colSpan="6" style={styles.noResults}>Loading...</td></tr>
                ) : searchResults.length > 0 ? (
                    searchResults.map(lead => (
                        <tr key={lead.id}>
                            <td style={styles.td}>{lead.humanReadableId || 'N/A'}</td>
                            <td style={styles.td}>{lead.clientInfo?.name}</td>
                            <td style={styles.td}>{projects.find(p => p.id === filters.project)?.projectName}</td>
                            <td style={styles.td}>{lead.currentStatus}</td>
                            <td style={styles.td}>{lead.updatedAt?.toDate().toLocaleDateString()}</td>
                            <td style={styles.td}>{advisers.find(a => a.id === lead.adviserId)?.name || 'N/A'}</td>
                        </tr>
                    ))
                ) : (
                    searched && <tr><td colSpan="6" style={styles.noResults}>No leads found.</td></tr>
                )}
            </tbody>
        </table>
      </div>

      <div style={styles.card}>
          {selectedState ? (
              <>
                <button onClick={() => setSelectedState(null)} style={styles.backButton}>← Back to All States</button>
                <BarChart title={`Lead Distribution for ${selectedState}`} data={cityDistribution} />
              </>
          ) : (
            <BarChart title="Lead Distribution by State" data={stateDistribution} onBarClick={handleStateClick} />
          )}
      </div>
    </div>
  );
};

export default Reports;