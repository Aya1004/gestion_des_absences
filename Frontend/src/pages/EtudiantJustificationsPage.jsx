import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function EtudiantJustificationsPage() {
  const [user, setUser] = useState(null);
  const [absences, setAbsences] = useState([]);
  const [justifications, setJustifications] = useState({}); // { absenceId: justification }
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [justifyingAbsence, setJustifyingAbsence] = useState(null);
  const [justificationText, setJustificationText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.type !== 'etudiant') {
      navigate('/dashboard');
      return;
    }
    setUser(parsedUser);
    loadData(parsedUser.id);
  }, [navigate]);

  const loadData = async (etudiantId) => {
    try {
      // Normaliser l'ID de l'étudiant
      const normalizedEtudiantId = String(etudiantId);
      
      // Charger les absences de l'étudiant
      const absencesRes = await fetch(`/api/absences?etudiant=${etudiantId}`);
      if (absencesRes.ok) {
        const allAbsences = await absencesRes.json();
        const etudiantAbsences = allAbsences.filter(a => {
          if (!a.etudiant || a.statut !== 'absent') return false;
          // Normaliser les IDs pour comparaison
          const absenceEtudiantId = a.etudiant._id 
            ? String(a.etudiant._id) 
            : (a.etudiant.id ? String(a.etudiant.id) : String(a.etudiant));
          return absenceEtudiantId === normalizedEtudiantId;
        });
        setAbsences(etudiantAbsences);
      }

      // Charger les justifications existantes (seulement pour les absences de cet étudiant)
      const justifRes = await fetch('/api/justifications');
      if (justifRes.ok) {
        const allJustifications = await justifRes.json();
        const justifMap = {};
        allJustifications.forEach(j => {
          const absence = j.absence;
          if (absence) {
            // Vérifier que la justification appartient à cet étudiant
            const absenceEtudiantId = absence.etudiant?._id 
              ? String(absence.etudiant._id) 
              : (absence.etudiant?.id ? String(absence.etudiant.id) : (absence.etudiant ? String(absence.etudiant) : null));
            
            if (absenceEtudiantId === normalizedEtudiantId) {
              const absenceId = absence._id || absence.id || String(absence);
              justifMap[absenceId] = j;
            }
          }
        });
        setJustifications(justifMap);
      }
    } catch (err) {
      console.error('Erreur chargement données:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJustify = (absence) => {
    setJustifyingAbsence(absence);
    const existingJustif = justifications[absence._id];
    setJustificationText(existingJustif?.commentaire || '');
  };

  const handleSubmitJustification = async (e) => {
    e.preventDefault();
    if (!justificationText.trim()) {
      setMessage('Veuillez saisir un commentaire de justification.');
      setSuccess(false);
      return;
    }

    try {
      const absenceId = justifyingAbsence._id;
      const existingJustif = justifications[absenceId];

      let response;
      if (existingJustif) {
        // Mettre à jour la justification existante
        response = await fetch(`/api/justifications/${existingJustif._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            absence: absenceId,
            fichier: existingJustif.fichier || '',
            commentaire: justificationText,
            etat: 'en attente'
          })
        });
      } else {
        // Créer une nouvelle justification
        response = await fetch('/api/justifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            absence: absenceId,
            fichier: '', // Optionnel pour l'instant
            commentaire: justificationText,
            etat: 'en attente'
          })
        });
      }

      if (response.ok) {
        const data = await response.json();
        setJustifications(prev => ({
          ...prev,
          [absenceId]: data
        }));
        setSuccess(true);
        setMessage('Justification soumise avec succès !');
        setJustifyingAbsence(null);
        setJustificationText('');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setSuccess(false);
        setMessage(errorData.message || 'Erreur lors de la soumission de la justification.');
      }
    } catch (err) {
      setSuccess(false);
      setMessage('Erreur de connexion au serveur.');
    }
  };

  const getEtatColor = (etat) => {
    switch (etat) {
      case 'validé': return '#2e7d32';
      case 'refusé': return '#c62828';
      default: return '#f57c00';
    }
  };

  const getEtatLabel = (etat) => {
    switch (etat) {
      case 'validé': return 'Validé';
      case 'refusé': return 'Refusé';
      default: return 'En attente';
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Chargement...</div>
      </div>
    );
  }

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
          Mes absences et justifications
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

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
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

        {/* Liste des absences */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#222' }}>
            Mes absences ({absences.length})
          </h2>

          {absences.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
              Aucune absence enregistrée
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#555' }}>Date</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#555' }}>Module</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#555' }}>Heure</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#555' }}>Justification</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#555' }}>État</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#555' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {absences.map(absence => {
                    const absenceId = absence._id;
                    const justification = justifications[absenceId];
                    const seanceDate = absence.seance?.date_seance 
                      ? new Date(absence.seance.date_seance) 
                      : null;
                    
                    return (
                      <tr key={absenceId} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.75rem' }}>
                          {seanceDate ? seanceDate.toLocaleDateString('fr-FR') : 'N/A'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {absence.seance?.module?.nom_module || absence.seance?.module?.nom || 'N/A'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {absence.seance?.heure_debut && absence.seance?.heure_fin
                            ? `${absence.seance.heure_debut} - ${absence.seance.heure_fin}`
                            : 'N/A'}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#888', maxWidth: '200px' }}>
                          {justification?.commentaire || '-'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {justification ? (
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: 4,
                              background: getEtatColor(justification.etat) + '20',
                              color: getEtatColor(justification.etat),
                              fontSize: '0.875rem',
                              fontWeight: 500
                            }}>
                              {getEtatLabel(justification.etat)}
                            </span>
                          ) : (
                            <span style={{ color: '#888' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <button
                            onClick={() => handleJustify(absence)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: justification ? '#1976d2' : '#388e3c',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            {justification ? 'Modifier' : 'Justifier'}
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

        {/* Modal de justification */}
        {justifyingAbsence && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#222' }}>
                Justifier l'absence
              </h3>
              <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Séance du {justifyingAbsence.seance?.date_seance 
                  ? new Date(justifyingAbsence.seance.date_seance).toLocaleDateString('fr-FR')
                  : 'N/A'} - {justifyingAbsence.seance?.module?.nom_module || 'Module'}
              </p>
              <form onSubmit={handleSubmitJustification}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 5 }}>
                  Commentaire de justification
                </label>
                <textarea
                  value={justificationText}
                  onChange={e => setJustificationText(e.target.value)}
                  placeholder="Expliquez la raison de votre absence..."
                  required
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1.5px solid #cfd7e6',
                    borderRadius: 6,
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#388e3c',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Soumettre
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setJustifyingAbsence(null);
                      setJustificationText('');
                    }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#ccc',
                      color: '#222',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

