// src/NewLead.jsx
import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, runTransaction, query, where } from 'firebase/firestore';

const usStates = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
];

const majorCitiesByState = {
    'Alabama': ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa', 'Hoover', 'Dothan', 'Auburn', 'Decatur', 'Madison', 'Florence', 'Gadsden'],
    'Alaska': ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan', 'Wasilla', 'Kenai', 'Kodiak', 'Palmer', 'Bethel', 'Homer', 'Valdez'],
    'Arizona': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 'Tempe', 'Peoria', 'Surprise', 'Yuma', 'Avondale'],
    'Arkansas': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro', 'North Little Rock', 'Conway', 'Rogers', 'Pine Bluff', 'Bentonville', 'Hot Springs', 'Benton'],
    'California': ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside'],
    'Colorado': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Westminster', 'Pueblo', 'Centennial', 'Boulder', 'Greeley'],
    'Connecticut': ['Bridgeport', 'New Haven', 'Stamford', 'Hartford', 'Waterbury', 'Norwalk', 'Danbury', 'New Britain', 'West Hartford', 'Greenwich', 'Hamden', 'Bristol'],
    'Delaware': ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Bear', 'Glasgow', 'Hockessin', 'Brookside', 'Smyrna', 'Milford', 'Seaford', 'Georgetown'],
    'Florida': ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Port St. Lucie', 'Cape Coral', 'Tallahassee', 'Fort Lauderdale', 'Pembroke Pines', 'Hollywood'],
    'Georgia': ['Atlanta', 'Augusta', 'Columbus', 'Macon', 'Savannah', 'Athens', 'Sandy Springs', 'South Fulton', 'Roswell', 'Johns Creek', 'Warner Robins', 'Albany'],
    'Hawaii': ['Honolulu', 'East Honolulu', 'Pearl City', 'Hilo', 'Waipahu', 'Kailua', 'Kaneohe', 'Mililani Town', 'Kahului', 'Ewa Gentry', 'Kihei', 'Makakilo'],
    'Idaho': ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Caldwell', 'Pocatello', 'Coeur d\'Alene', 'Twin Falls', 'Rexburg', 'Post Falls', 'Lewiston', 'Eagle'],
    'Illinois': ['Chicago', 'Aurora', 'Joliet', 'Naperville', 'Rockford', 'Springfield', 'Elgin', 'Peoria', 'Waukegan', 'Champaign', 'Cicero', 'Bloomington'],
    'Indiana': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers', 'Bloomington', 'Hammond', 'Gary', 'Lafayette', 'Muncie', 'Noblesville'],
    'Iowa': ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City', 'Waterloo', 'Ames', 'West Des Moines', 'Council Bluffs', 'Ankeny', 'Dubuque', 'Urbandale'],
    'Kansas': ['Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Olathe', 'Lawrence', 'Shawnee', 'Lenexa', 'Manhattan', 'Salina', 'Hutchinson', 'Leavenworth'],
    'Kentucky': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington', 'Richmond', 'Georgetown', 'Florence', 'Elizabethtown', 'Nicholasville', 'Hopkinsville', 'Jeffersontown'],
    'Louisiana': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles', 'Kenner', 'Bossier City', 'Monroe', 'Alexandria', 'Houma', 'Metairie', 'Marrero'],
    'Maine': ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn', 'Biddeford', 'Saco', 'Westbrook', 'Augusta', 'Waterville', 'Brunswick', 'Sanford'],
    'Maryland': ['Baltimore', 'Columbia', 'Germantown', 'Silver Spring', 'Waldorf', 'Frederick', 'Ellicott City', 'Glen Burnie', 'Gaithersburg', 'Rockville', 'Dundalk', 'Bethesda'],
    'Massachusetts': ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton', 'New Bedford', 'Lynn', 'Quincy', 'Newton', 'Fall River', 'Lawrence'],
    'Michigan': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Flint', 'Dearborn', 'Livonia', 'Troy', 'Westland', 'Farmington Hills'],
    'Minnesota': ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth', 'Bloomington', 'Brooklyn Park', 'Plymouth', 'Woodbury', 'Lakeville', 'Maple Grove', 'St. Cloud', 'Eagan'],
    'Mississippi': ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi', 'Meridian', 'Tupelo', 'Greenville', 'Olive Branch', 'Horn Lake', 'Clinton', 'Pearl'],
    'Missouri': ['Kansas City', 'Saint Louis', 'Springfield', 'Columbia', 'Independence', 'Lee\'s Summit', 'O\'Fallon', 'Saint Joseph', 'Saint Charles', 'Blue Springs', 'Saint Peters', 'Florissant'],
    'Montana': ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte', 'Helena', 'Kalispell', 'Havre', 'Anaconda', 'Miles City', 'Belgrade', 'Livingston'],
    'Nebraska': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney', 'Fremont', 'Hastings', 'Norfolk', 'Columbus', 'Papillion', 'North Platte', 'La Vista'],
    'Nevada': ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City', 'Fernley', 'Elko', 'Mesquite', 'Boulder City', 'Fallon', 'Winnemucca'],
    'New Hampshire': ['Manchester', 'Nashua', 'Concord', 'Dover', 'Rochester', 'Keene', 'Portsmouth', 'Laconia', 'Claremont', 'Lebanon', 'Somersworth', 'Londonderry'],
    'New Jersey': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Lakewood', 'Edison', 'Woodbridge', 'Toms River', 'Hamilton', 'Trenton', 'Clifton', 'Camden'],
    'New Mexico': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell', 'Farmington', 'Clovis', 'Hobbs', 'Alamogordo', 'Carlsbad', 'Gallup', 'Deming'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica', 'White Plains', 'Hempstead'],
    'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington', 'High Point', 'Concord', 'Asheville', 'Gastonia'],
    'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo', 'Williston', 'Dickinson', 'Mandan', 'Jamestown', 'Wahpeton', 'Devils Lake', 'Valley City'],
    'Ohio': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton', 'Youngstown', 'Lorain', 'Hamilton', 'Springfield'],
    'Oklahoma': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton', 'Edmond', 'Moore', 'Midwest City', 'Enid', 'Stillwater', 'Muskogee', 'Bartlesville'],
    'Oregon': ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro', 'Beaverton', 'Bend', 'Medford', 'Springfield', 'Corvallis', 'Albany', 'Tigard'],
    'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster', 'Harrisburg', 'Altoona', 'York', 'State College'],
    'Rhode Island': ['Providence', 'Cranston', 'Warwick', 'Pawtucket', 'East Providence', 'Woonsocket', 'Newport', 'Central Falls', 'Westerly', 'Coventry', 'Cumberland', 'North Providence'],
    'South Carolina': ['Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville', 'Summerville', 'Sumter', 'Goose Creek', 'Hilton Head Island', 'Myrtle Beach', 'Spartanburg'],
    'South Dakota': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown', 'Mitchell', 'Yankton', 'Pierre', 'Huron', 'Vermillion', 'Spearfish', 'Brandon'],
    'Tennessee': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin', 'Johnson City', 'Jackson', 'Hendersonville', 'Bartlett', 'Smyrna'],
    'Texas': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Laredo', 'Lubbock', 'Garland'],
    'Utah': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden', 'St. George', 'Layton', 'South Jordan', 'Lehi', 'Millcreek'],
    'Vermont': ['Burlington', 'South Burlington', 'Rutland', 'Essex Junction', 'Barre', 'Montpelier', 'Winooski', 'St. Albans', 'Newport', 'Bellows Falls', 'Brattleboro', 'Colchester'],
    'Virginia': ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria', 'Hampton', 'Roanoke', 'Portsmouth', 'Suffolk', 'Lynchburg', 'Harrisonburg'],
    'Washington': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Yakima', 'Federal Way', 'Spokane Valley', 'Bellingham'],
    'West Virginia': ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling', 'Weirton', 'Fairmont', 'Martinsburg', 'Beckley', 'Clarksburg', 'South Charleston', 'St. Albans'],
    'Wisconsin': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha', 'Eau Claire', 'Oshkosh', 'Janesville', 'West Allis', 'La Crosse'],
    'Wyoming': ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs', 'Sheridan', 'Green River', 'Evanston', 'Riverton', 'Jackson', 'Cody', 'Rawlins']
};

const NewLead = ({ user, setActivePage }) => {
  const [projects, setProjects] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [leadStatusOptions, setLeadStatusOptions] = useState([]);
  const [lawOffices, setLawOffices] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  
  const [formData, setFormData] = useState({
    project: '',
    sourceId: '',
    clientName: '',
    leadSource: '',
    clientPhone: '',
    leadStatus: '',
    clientEmail: '',
    lawOffice: '',
    city: '',
    state: '',
    briefDescription: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Cargar proyectos iniciales
  useEffect(() => {
    const fetchProjects = async () => {
      const q = query(collection(db, 'projects'));
      const querySnapshot = await getDocs(q);
      const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsData);
    };
    fetchProjects();
  }, []);

  // Cargar opciones dependientes cuando se selecciona un proyecto
  useEffect(() => {
    const fetchProjectOptions = async () => {
      if (!formData.project) {
        setLeadSources([]);
        setLeadStatusOptions([]);
        setLawOffices([]);
        return;
      }
      
      const selectedProject = projects.find(p => p.id === formData.project);
      if (selectedProject) {
        setLeadStatusOptions(selectedProject.projectConfig?.leadStatusOptions || []);
      }

      const sourcesRef = collection(db, 'projects', formData.project, 'leadSources');
      const officesRef = collection(db, 'projects', formData.project, 'lawOffices');

      const [sourcesSnap, officesSnap] = await Promise.all([getDocs(sourcesRef), getDocs(officesRef)]);
      
      const sourcesData = sourcesSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(source => source.sourceName);
      setLeadSources(sourcesData);

      const officesData = officesSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(office => office.name);
      setLawOffices(officesData);
    };
    fetchProjectOptions();
  }, [formData.project, projects]);

  // Update city suggestions when state changes
  useEffect(() => {
    if (formData.state) {
      setCitySuggestions(majorCitiesByState[formData.state] || []);
    } else {
      setCitySuggestions([]);
    }
  }, [formData.state]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setSuccess('');
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const isLawOfficeDisabled = formData.leadStatus !== 'Successful Lead';

  useEffect(() => {
    if (isLawOfficeDisabled) {
      setFormData(prev => ({ ...prev, lawOffice: '' }));
    }
  }, [formData.leadStatus, isLawOfficeDisabled]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project || !formData.clientName || !formData.leadStatus) {
      setError('Please fill out all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const counterRef = doc(db, 'counters', 'leadCounter');
      
      const newLeadId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        if (!counterDoc.exists()) {
          transaction.set(counterRef, { lastId: 1 });
          return '0000001';
        }
        const newId = counterDoc.data().lastId + 1;
        transaction.update(counterRef, { lastId: newId });
        return String(newId).padStart(7, '0');
      });

      const newLeadRef = doc(collection(db, 'projects', formData.project, 'Client'));
      const creationTime = new Date();

      const newLeadData = {
        humanReadableId: newLeadId,
        adviserId: user.uid,
        sourceId: formData.sourceId,
        clientInfo: {
          name: formData.clientName,
          phone: formData.clientPhone,
          email: formData.clientEmail,
          city: formData.city,
          state: formData.state,
        },
        caseDetails: {
          briefDescription: formData.briefDescription,
        },
        leadSource: formData.leadSource,
        currentStatus: formData.leadStatus,
        lawOffice: formData.lawOffice || null,
        createdAt: creationTime,
        updatedAt: creationTime,
        callHistory: [{
          status: formData.leadStatus,
          briefDescription: formData.briefDescription,
          adviserId: user.uid,
          timestamp: creationTime
        }],
      };
      
      await runTransaction(db, async (transaction) => {
        transaction.set(newLeadRef, newLeadData);
      });

      setSuccess(`Lead ${newLeadId} created successfully!`);
      setFormData({
        project: '', sourceId: '', clientName: '', leadSource: '', clientPhone: '',
        leadStatus: '', clientEmail: '', lawOffice: '', city: '', state: '',
        briefDescription: '',
      });
      setTimeout(() => setActivePage('Dashboard'), 2000);

    } catch (error) {
      console.error("Error en transacción:", error);
      setError('Could not save the lead. There was a transaction error.');
    } finally {
      setLoading(false);
    }
  };


  const styles = {
    container: { maxWidth: '1000px', margin: '2rem auto', padding: '2rem', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#ffffff', borderRadius: '8px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
    header: { marginBottom: '2rem', borderBottom: '1px solid #e9ecef', paddingBottom: '1rem' },
    title: { fontSize: '1.75rem', fontWeight: '600', color: '#212529', margin: '0 0 0.5rem 0' },
    subtitle: { fontSize: '1rem', color: '#6c757d', margin: 0 },
    sectionTitle: { fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0', color: '#343a40' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
    formGroup: { display: 'flex', flexDirection: 'column' },
    label: { marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#495057' },
    input: { width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '1rem' },
    select: { width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '1rem', backgroundColor: 'white' },
    textarea: { width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '1rem', minHeight: '100px', resize: 'vertical' },
    fullWidth: { gridColumn: '1 / -1' },
    button: { backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '500', cursor: 'pointer', justifySelf: 'start', marginTop: '1rem' },
    disabled: { backgroundColor: '#e9ecef', cursor: 'not-allowed' },
    message: { marginTop: '1rem', padding: '0.75rem', borderRadius: '4px', textAlign: 'center' },
    error: { backgroundColor: '#f8d7da', color: '#721c24' },
    success: { backgroundColor: '#d4edda', color: '#155724' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create New Lead</h1>
          <p style={styles.subtitle}>Fill in the details below to register a new lead.</p>
        </div>
        
        <form onSubmit={handleSubmit} autoComplete="new-password">
          <h2 style={styles.sectionTitle}>Lead Information</h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Project</label>
              <select name="project" value={formData.project} onChange={handleInputChange} style={styles.select}>
                <option value="">Select a project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Lead Source ID (Optional)</label>
              <input type="text" name="sourceId" value={formData.sourceId} onChange={handleInputChange} style={styles.input} autoComplete="new-password" />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Client Name</label>
              <input type="text" name="clientName" value={formData.clientName} onChange={handleInputChange} style={styles.input} autoComplete="new-password" />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Lead Source</label>
              <select name="leadSource" value={formData.leadSource} onChange={handleInputChange} style={styles.select} disabled={!formData.project}>
                <option value="">Select lead source</option>
                {leadSources.map(s => <option key={s.id} value={s.sourceName}>{s.sourceName}</option>)}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Client Phone</label>
              <input type="tel" name="clientPhone" value={formData.clientPhone} onChange={handleInputChange} style={styles.input} autoComplete="new-password" />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Lead Status</label>
              <select name="leadStatus" value={formData.leadStatus} onChange={handleInputChange} style={styles.select} disabled={!formData.project}>
                <option value="">Select lead status</option>
                {leadStatusOptions.filter(o => o !== 'Case Signed/Follow Up').map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Client Email (Optional)</label>
              <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleInputChange} style={styles.input} autoComplete="new-password" />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Law Office</label>
              <select name="lawOffice" value={formData.lawOffice} onChange={handleInputChange} style={{...styles.select, ...(isLawOfficeDisabled && styles.disabled)}} disabled={isLawOfficeDisabled}>
                <option value="">N/A for this status</option>
                {lawOffices.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>State</label>
              <select name="state" value={formData.state} onChange={handleInputChange} style={styles.select}>
                <option value="">Select a state</option>
                {usStates.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>City</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleInputChange} 
                style={styles.input}
                list="city-suggestions"
                disabled={!formData.state}
              />
              <datalist id="city-suggestions">
                {citySuggestions.map(city => <option key={city} value={city} />)}
              </datalist>
            </div>

            <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
              <label style={styles.label}>Initial Outcome / Notes</label>
              <textarea name="briefDescription" value={formData.briefDescription} onChange={handleInputChange} style={styles.textarea} />
            </div>
          </div>
          
          <button type="submit" style={styles.button} disabled={loading}>{loading ? 'Saving...' : 'Create Lead'}</button>
          
          {error && <p style={{...styles.message, ...styles.error}}>{error}</p>}
          {success && <p style={{...styles.message, ...styles.success}}>{success}</p>}
        </form>
      </div>
    </div>
  );
};

export default NewLead;