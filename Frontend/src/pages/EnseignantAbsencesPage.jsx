import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function EnseignantAbsencesPage() {
  const [user, setUser] = useState(null);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedSeance, setSelectedSeance] = useState('');
  const [etudiants, setEtudiants] = useState([]);
  const [seances, setSeances] = useState([]);
  const [modules, setModules] = useState([]);
  const [classes, setClasses] = useState([]); // Toutes les classes disponibles
  const [absences, setAbsences] = useState({}); // { etudiantId: { statut, motif } }
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAddSeance, setShowAddSeance] = useState(false);
  const [newSeance, setNewSeance] = useState({
    date_seance: '',
    heure_debut: '',
    heure_fin: '',
    module: '',
    classe: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.type !== 'enseignant') {
      navigate('/dashboard');
      return;
    }
    setUser(parsedUser);
    loadModules();
    loadAllClasses(); // Charger toutes les classes disponibles
  }, [navigate]);

  useEffect(() => {
    if (selectedClasse) {
      loadEtudiants(selectedClasse);
      loadSeances(selectedClasse);
    }
  }, [selectedClasse]);

  useEffect(() => {
    if (selectedSeance && selectedClasse) {
      loadAbsencesForSeance(selectedSeance);
    }
  }, [selectedSeance]);

  const loadModules = async () => {
    try {
      const res = await fetch('/api/modules');
      if (res.ok) {
        const data = await res.json();
        setModules(data);
      }
    } catch (err) {
      console.error('Erreur chargement modules:', err);
    }
  };

  const loadAllClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
        console.log('Classes chargées:', data);
      }
    } catch (err) {
      console.error('Erreur chargement classes:', err);
    }
  };

  const loadEtudiants = async (classeId) => {
    try {
      const res = await fetch('/api/etudiants');
      if (res.ok) {
        const data = await res.json();
        const etudiantsClasse = data.filter(e => e.classe?._id === classeId || e.classe === classeId);
        setEtudiants(etudiantsClasse);
      }
    } catch (err) {
      console.error('Erreur chargement étudiants:', err);
    }
  };

  const loadSeances = async (classeId) => {
    try {
      const res = await fetch('/api/seances');
      if (res.ok) {
        const data = await res.json();
        const seancesClasse = data.filter(s => 
          (s.classe?._id === classeId || s.classe === classeId) &&
          (s.enseignant?._id === user?.id || s.enseignant === user?.id)
        );
        setSeances(seancesClasse);
      }
    } catch (err) {
      console.error('Erreur chargement séances:', err);
    }
  };

  const loadAbsencesForSeance = async (seanceId) => {
    try {
      const res = await fetch('/api/absences');
      if (res.ok) {
        const data = await res.json();
        const absencesSeance = data.filter(a => a.seance?._id === seanceId || a.seance === seanceId);
        const absencesMap = {};
        absencesSeance.forEach(a => {
          const etudiantId = a.etudiant?._id || a.etudiant;
          absencesMap[etudiantId] = {
            statut: a.statut,
            absenceId: a._id
          };
        });
        setAbsences(absencesMap);
      }
    } catch (err) {
      console.error('Erreur chargement absences:', err);
    }
  };

  const handleStatutChange = (etudiantId, statut) => {
    setAbsences(prev => ({
      ...prev,
      [etudiantId]: {
        ...prev[etudiantId],
        statut
      }
    }));
  };

  const handleSaveAbsence = async (etudiantId) => {
    if (!selectedSeance) {
      setMessage('Veuillez sélectionner une séance.');
      setSuccess(false);
      return;
    }

    const absence = absences[etudiantId];
    if (!absence || !absence.statut) {
      setMessage('Veuillez sélectionner un statut (présent/absent).');
      setSuccess(false);
      return;
    }

    try {
      let response;
      if (absence.absenceId) {
        // Mettre à jour l'absence existante
        response = await fetch(`/api/absences/${absence.absenceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            etudiant: etudiantId,
            seance: selectedSeance,
            statut: absence.statut
          })
        });
      } else {
        // Créer une nouvelle absence
        response = await fetch('/api/absences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            etudiant: etudiantId,
            seance: selectedSeance,
            statut: absence.statut
          })
        });
      }

      if (response.ok) {
        const data = await response.json();
        setAbsences(prev => ({
          ...prev,
          [etudiantId]: {
            ...prev[etudiantId],
            absenceId: data._id
          }
        }));
        setSuccess(true);
        setMessage('Absence enregistrée avec succès !');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setSuccess(false);
        setMessage(errorData.message || 'Erreur lors de l\'enregistrement.');
      }
    } catch (err) {
      setSuccess(false);
      setMessage('Erreur de connexion au serveur.');
    }
  };

  const handleSaveAll = async () => {
    if (!selectedSeance) {
      setMessage('Veuillez sélectionner une séance.');
      setSuccess(false);
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const etudiantId of Object.keys(absences)) {
      const absence = absences[etudiantId];
      if (absence && absence.statut) {
        try {
          let response;
          if (absence.absenceId) {
            response = await fetch(`/api/absences/${absence.absenceId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                etudiant: etudiantId,
                seance: selectedSeance,
                statut: absence.statut
              })
            });
          } else {
            response = await fetch('/api/absences', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                etudiant: etudiantId,
                seance: selectedSeance,
                statut: absence.statut
              })
            });
          }

          if (response.ok) {
            const data = await response.json();
            setAbsences(prev => ({
              ...prev,
              [etudiantId]: {
                ...prev[etudiantId],
                absenceId: data._id
              }
            }));
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }
    }

    setLoading(false);
    if (successCount > 0) {
      setSuccess(true);
      setMessage(`${successCount} absence(s) enregistrée(s) avec succès !`);
    } else {
      setSuccess(false);
      setMessage('Aucune absence n\'a pu être enregistrée.');
    }
    setTimeout(() => setMessage(''), 5000);
  };

  const handleCreateSeance = async (e) => {
    e.preventDefault();
    if (!newSeance.date_seance || !newSeance.heure_debut || !newSeance.heure_fin || !newSeance.module || !newSeance.classe) {
      setMessage('Veuillez remplir tous les champs.');
      setSuccess(false);
      return;
    }

    try {
      const response = await fetch('/api/seances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date_seance: newSeance.date_seance,
          heure_debut: newSeance.heure_debut,
          heure_fin: newSeance.heure_fin,
          module: newSeance.module,
          classe: newSeance.classe,
          enseignant: user.id
        })
      });

      if (response.ok) {
        setSuccess(true);
        setMessage('Séance créée avec succès !');
        setNewSeance({
          date_seance: '',
          heure_debut: '',
          heure_fin: '',
          module: '',
          classe: ''
        });
        setShowAddSeance(false);
        // Recharger les séances
        if (selectedClasse) {
          loadSeances(selectedClasse);
        }
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setSuccess(false);
        setMessage(errorData.message || 'Erreur lors de la création de la séance.');
      }
    } catch (err) {
      setSuccess(false);
      setMessage('Erreur de connexion au serveur.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, color: '#1976d2', fontSize: '1.5rem' }}>
          Gestion des absences
        </h1>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '0.5rem 1rem',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Retour au tableau de bord
        </button>
      </header>

      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Sélection de classe et séance */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#222' }}>
            Sélection
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 5 }}>Classe</label>
              <select
                value={selectedClasse}
                onChange={e => {
                  setSelectedClasse(e.target.value);
                  setSelectedSeance('');
                  setEtudiants([]);
                  setAbsences({});
                }}
                style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #cfd7e6', borderRadius: 6, fontSize: '1rem' }}
              >
                <option value="">Sélectionnez une classe</option>
                {/* Afficher d'abord les classes de l'enseignant, puis toutes les autres */}
                {user.classes && user.classes.length > 0 ? (
                  user.classes.map(cl => {
                    const classeId = cl._id || cl;
                    const classeData = typeof cl === 'string' 
                      ? classes.find(c => c._id === cl) 
                      : cl;
                    return (
                      <option key={classeId} value={classeId}>
                        {classeData?.nom_classe || classeData?.niveau && classeData?.filiere 
                          ? `${classeData.niveau} - ${classeData.filiere}` 
                          : 'Classe'}
                      </option>
                    );
                  })
                ) : (
                  // Si l'enseignant n'a pas de classes assignées, afficher toutes les classes
                  classes.map(cl => (
                    <option key={cl._id} value={cl._id}>
                      {cl.nom_classe || `${cl.niveau} - ${cl.filiere}`}
                    </option>
                  ))
                )}
              </select>
              {(!user.classes || user.classes.length === 0) && classes.length === 0 && (
                <p style={{ color: '#d32f2f', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Aucune classe disponible. Veuillez créer des classes dans la base de données.
                </p>
              )}
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <label style={{ display: 'block', fontWeight: 500 }}>Séance</label>
                <button
                  type="button"
                  onClick={() => setShowAddSeance(!showAddSeance)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  {showAddSeance ? 'Annuler' : '+ Nouvelle séance'}
                </button>
              </div>
              {!showAddSeance ? (
                <select
                  value={selectedSeance}
                  onChange={e => setSelectedSeance(e.target.value)}
                  disabled={!selectedClasse}
                  style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #cfd7e6', borderRadius: 6, fontSize: '1rem' }}
                >
                  <option value="">Sélectionnez une séance</option>
                  {seances.map(seance => (
                    <option key={seance._id} value={seance._id}>
                      {seance.module?.nom_module || seance.module?.nom || 'Module'} - {new Date(seance.date_seance).toLocaleDateString('fr-FR')} ({seance.heure_debut} - {seance.heure_fin})
                    </option>
                  ))}
                </select>
              ) : (
                <form onSubmit={handleCreateSeance} style={{
                  background: '#f9fafb',
                  padding: '1rem',
                  borderRadius: 6,
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: 5 }}>Date de la séance</label>
                    <input
                      type="date"
                      value={newSeance.date_seance}
                      onChange={e => setNewSeance({ ...newSeance, date_seance: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #cfd7e6', borderRadius: 6 }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 500, marginBottom: 5 }}>Heure de début</label>
                      <input
                        type="time"
                        value={newSeance.heure_debut}
                        onChange={e => setNewSeance({ ...newSeance, heure_debut: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #cfd7e6', borderRadius: 6 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 500, marginBottom: 5 }}>Heure de fin</label>
                      <input
                        type="time"
                        value={newSeance.heure_fin}
                        onChange={e => setNewSeance({ ...newSeance, heure_fin: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #cfd7e6', borderRadius: 6 }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 500, marginBottom: 5 }}>Module</label>
                      <select
                        value={newSeance.module}
                        onChange={e => setNewSeance({ ...newSeance, module: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #cfd7e6', borderRadius: 6 }}
                      >
                        <option value="">Sélectionnez un module</option>
                        {modules.map(mod => (
                          <option key={mod._id} value={mod._id}>
                            {mod.nom_module || mod.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 500, marginBottom: 5 }}>Classe</label>
                      <select
                        value={newSeance.classe}
                        onChange={e => setNewSeance({ ...newSeance, classe: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #cfd7e6', borderRadius: 6 }}
                      >
                        <option value="">Sélectionnez une classe</option>
                        {classes.map(cl => (
                          <option key={cl._id} value={cl._id}>
                            {cl.nom_classe || `${cl.niveau} - ${cl.filiere}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#388e3c',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Créer la séance
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            marginBottom: '1rem',
            padding: '1rem',
            borderRadius: 6,
            background: success ? '#e8f5e9' : '#ffebee',
            color: success ? '#2e7d32' : '#c62828',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {/* Liste des étudiants */}
        {selectedClasse && selectedSeance && (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: '#222' }}>
                Liste des étudiants ({etudiants.length})
              </h2>
              <button
                onClick={handleSaveAll}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#388e3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer tout'}
              </button>
            </div>

            {etudiants.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                Aucun étudiant dans cette classe
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#555' }}>Étudiant</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#555' }}>Statut</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#555' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {etudiants.map(etudiant => {
                      const etudiantId = etudiant._id || etudiant.id;
                      const absence = absences[etudiantId] || { statut: 'present' };
                      return (
                        <tr key={etudiantId} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '0.75rem' }}>
                            {etudiant.prenom} {etudiant.nom}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <select
                              value={absence.statut}
                              onChange={e => handleStatutChange(etudiantId, e.target.value)}
                              style={{ padding: '0.5rem', border: '1.5px solid #cfd7e6', borderRadius: 4 }}
                            >
                              <option value="present">Présent</option>
                              <option value="absent">Absent</option>
                            </select>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <button
                              onClick={() => handleSaveAbsence(etudiantId)}
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#1976d2',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer'
                              }}
                            >
                              Enregistrer
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

