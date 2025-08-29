// src/LeadDetail.jsx
import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { doc, getDoc, collection, getDocs, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';

const InfoField = ({ label, value }) => {
  const styles = {
    fieldContainer: { marginBottom: '1rem' },
    label: { fontSize: '0.8rem', color: '#6c757d', marginBottom: '0.25rem', display: 'block' },
    value: { fontSize: '1rem', color: '#212529', fontWeight: '500' },
  };
  return (
    <div style={styles.fieldContainer}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value || 'N/A'}</span>
    </div>
  );
};

const LeadDetail = ({ leadId, projectId, onBack, user }) => {
  const [leadData, setLeadData] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [lawOffices, setLawOffices] = useState([]);
  const [advisersMap, setAdvisersMap] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [followUpStatus, setFollowUpStatus] = useState('');
  const [followUpOffice, setFollowUpOffice] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const leadDocRef = doc(db, 'projects', projectId, 'Client', leadId);
      const leadSnap = await getDoc(leadDocRef);
      const currentLeadData = leadSnap.exists() ? { id: leadSnap.id, ...leadSnap.data() } : null;
      setLeadData(currentLeadData);

      const projectDocRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectDocRef);
      if (projectSnap.exists()) setProjectData(projectSnap.data());

      const officesRef = collection(db, 'projects', projectId, 'lawOffices');
      const officesSnap = await getDocs(officesRef);
      setLawOffices(officesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(o => o.status === 'Active'));

      if (currentLeadData) {
        const adviserIds = [...new Set([
          currentLeadData.adviserId, 
          ...(currentLeadData.callHistory || []).map(call => call.adviserId)
        ])];
        
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

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [leadId, projectId]);

  const getFollowUpStatusOptions = () => {
    if (!projectData?.projectConfig?.leadStatusOptions) return [];
    if (leadData?.currentStatus !== 'Successful Lead') {
      return projectData.projectConfig.leadStatusOptions.filter(
        status => status !== 'Case Signed/Follow Up'
      );
    }
    return projectData.projectConfig.leadStatusOptions;
  };

  const handleSaveFollowUp = async () => {
    if (!followUpStatus || !followUpNotes) {
      alert('Please select a new status and add notes.');
      return;
    }
    setIsSaving(true);
    const leadDocRef = doc(db, 'projects', projectId, 'Client', leadId);

    try {
      const newFollowUp = {
        status: followUpStatus,
        briefDescription: followUpNotes,
        adviserId: user.uid,
        adviserEmail: user.email,
        timestamp: new Date(),
      };

      await updateDoc(leadDocRef, {
        currentStatus: followUpStatus,
        lawOffice: followUpOffice || leadData.lawOffice,
        updatedAt: serverTimestamp(),
        callHistory: arrayUnion(newFollowUp)
      });

      setFollowUpStatus('');
      setFollowUpOffice('');
      setFollowUpNotes('');
      await fetchAllData();

    } catch (err) {
      console.error("Error saving follow-up:", err);
      alert('Failed to save follow-up.');
    } finally {
      setIsSaving(false);
    }
  };

  const styles = {
    container: { padding: '2rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' },
    mainContent: { display: 'flex', flexDirection: 'column', gap: '2rem' },
    card: { backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    header: { gridColumn: '1 / -1', marginBottom: '1rem' },
    title: { fontSize: '2rem', fontWeight: '600', color: '#212529', margin: 0 },
    subtitle: { fontSize: '1rem', color: '#6c757d', marginTop: '0.5rem' },
    infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
    callHistoryCard: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    historyItem: { borderBottom: '1px solid #e9ecef', paddingBottom: '1rem' },
    historyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
    historyStatus: { fontWeight: 'bold' },
    historyDate: { fontSize: '0.8rem', color: '#6c757d' },
    historyNotes: { fontSize: '0.9rem', color: '#495057' },
    formGroup: { display: 'flex', flexDirection: 'column', marginBottom: '1rem' },
    label: { marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#495057' },
    input: { padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '1rem' },
    textarea: { padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '1rem', minHeight: '100px', resize: 'vertical' },
    button: { padding: '0.75rem 1.5rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: '500', cursor: 'pointer', marginTop: '1rem', width: 'fit-content' },
  };

  if (loading) return <p style={{padding: '2rem'}}>Cargando detalles del lead...</p>;
  if (!leadData) return <p style={{padding: '2rem'}}>No se encontró el lead.</p>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={onBack} style={{marginBottom: '1rem'}}>← Volver al Dashboard</button>
        <h1 style={styles.title}>Lead Details</h1>
        <p style={styles.subtitle}>
          Internal ID: <strong>{leadData.humanReadableId || leadData.id}</strong> | Source ID: <strong>{leadData.sourceId || 'N/A'}</strong>
        </p>
      </header>

      <div style={styles.mainContent}>
        <div style={styles.card}>
          <h2 style={{...styles.title, fontSize: '1.25rem', marginBottom: '1.5rem'}}>Client Information</h2>
          <div style={styles.infoGrid}>
            <InfoField label="Client Name" value={leadData.clientInfo.name} />
            <InfoField label="Client Phone" value={leadData.clientInfo.phone} />
            <InfoField label="Client Email" value={leadData.clientInfo.email} />
            <InfoField label="Project" value={projectData?.projectName || 'N/A'} />
            <InfoField label="Lead Source" value={leadData.leadSource} />
            <InfoField label="Assigned Advisor" value={advisersMap[leadData.adviserId] || 'N/A'} />
            <InfoField label="City" value={leadData.clientInfo.city} />
            <InfoField label="State" value={leadData.clientInfo.state} />
            <InfoField label="First Call" value={leadData.createdAt?.toDate().toLocaleString()} />
            <InfoField label="Last Call" value={leadData.updatedAt?.toDate().toLocaleString()} />
            <InfoField label="Current Status" value={leadData.currentStatus} />
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={{...styles.title, fontSize: '1.25rem', marginBottom: '1.5rem'}}>Log Follow-up Call</h2>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Update Lead Status</label>
              <select 
                style={styles.input} 
                value={followUpStatus} 
                onChange={(e) => setFollowUpStatus(e.target.value)}
              >
                <option value="">Select new status</option>
                {getFollowUpStatusOptions().map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Law Office</label>
              <select 
                style={styles.input}
                value={followUpOffice}
                onChange={(e) => setFollowUpOffice(e.target.value)}
                disabled={followUpStatus !== 'Successful Lead'}
              >
                <option value="">{followUpStatus === 'Successful Lead' ? 'Select law office' : 'N/A for this status'}</option>
                {lawOffices.map(office => (
                  <option key={office.id} value={office.name}>{office.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Call Outcome / Notes</label>
            <textarea 
              style={styles.textarea} 
              placeholder="Describe the outcome..."
              value={followUpNotes}
              onChange={(e) => setFollowUpNotes(e.target.value)}
            ></textarea>
          </div>
          <button style={styles.button} onClick={handleSaveFollowUp} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Follow-up'}
          </button>
        </div>
      </div>
      
      <div style={{...styles.card, ...styles.callHistoryCard}}>
        <h2 style={{...styles.title, fontSize: '1.25rem'}}>Call History</h2>
        {leadData.callHistory && leadData.callHistory.slice().reverse().map((call, index) => (
          <div key={index} style={styles.historyItem}>
            <div style={styles.historyHeader}>
              <span style={styles.historyStatus}>{call.status}</span>
              <span style={styles.historyDate}>{call.timestamp?.toDate().toLocaleDateString()}</span>
            </div>
            <p style={styles.historyNotes}>{call.briefDescription}</p>
            <small style={{color: '#6c757d'}}>By: {advisersMap[call.adviserId] || call.adviserEmail}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadDetail;