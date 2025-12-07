import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [recentAbsences, setRecentAbsences] = useState([]);
  const [justifications, setJustifications] = useState({}); // { absenceId: justification }
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    loadDashboardData(parsedUser);
  }, [navigate]);

  const loadDashboardData = async (currentUser) => {
    try {
      const userType = currentUser.type;
      // Pour les étudiants, utiliser le paramètre etudiant dans l'API
      const absencesRes = userType === 'etudiant' 
        ? await fetch(`/api/absences?etudiant=${currentUser.id}`) 
        : await fetch('/api/absences');
      const absences = absencesRes.ok ? await absencesRes.json() : [];

      try {
        const justifRes = await fetch('/api/justifications');
        if (justifRes.ok) {
          const allJustifications = await justifRes.json();
          const justifMap = {};
          if (userType === 'enseignant') {
            allJustifications.forEach(j => {
              const absenceId = j.absence?._id || j.absence;
              justifMap[absenceId] = j;
            });
          } else if (userType === 'etudiant') {
            const etudiantId = String(currentUser.id || currentUser._id);
            allJustifications.forEach(j => {
              const absence = j.absence;
              if (absence && absence.etudiant) {
                const absenceEtudiantId = absence.etudiant._id 
                  ? String(absence.etudiant._id) 
                  : (absence.etudiant.id ? String(absence.etudiant.id) : String(absence.etudiant));
                if (absenceEtudiantId === etudiantId) {
                  const absenceId = absence._id || absence.id || String(absence);
                  justifMap[absenceId] = j;
                }
              }
            });
          }
          setJustifications(justifMap);
        }
      } catch (err) {
        console.error('Erreur chargement justifications:', err);
      }

      let filteredAbsences = absences;
      if (userType === 'etudiant') {
        // Les absences sont déjà filtrées par l'API, mais on peut faire un double check
        const etudiantId = String(currentUser.id || currentUser._id);
        filteredAbsences = absences.filter(a => {
          if (!a.etudiant) return false;
          const absenceEtudiantId = a.etudiant._id 
            ? String(a.etudiant._id) 
            : (a.etudiant.id ? String(a.etudiant.id) : String(a.etudiant));
          return absenceEtudiantId === etudiantId;
        });
      } else if (userType === 'enseignant') {
        const enseignantClasses = currentUser.classes?.map(c => c._id || c) || [];
        filteredAbsences = absences.filter(a => {
          const seanceClasse = a.seance?.classe?._id || a.seance?.classe;
          return enseignantClasses.includes(seanceClasse);
        });
      }

      const sortedAbsences = filteredAbsences
        .sort((a, b) => {
          const dateA = a.seance?.date_seance ? new Date(a.seance.date_seance) : (a.seance?.date ? new Date(a.seance.date) : 0);
          const dateB = b.seance?.date_seance ? new Date(b.seance.date_seance) : (b.seance?.date ? new Date(b.seance.date) : 0);
          return dateB - dateA;
        })
        .slice(0, 5);
      setRecentAbsences(sortedAbsences);
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Gestion des absences</h1>
        <div className="dashboard-header-actions">
          {user && (
            <div className="user-info">
              <span>{user.prenom} {user.nom}</span>
              <span className="user-type">{user.type === 'etudiant' ? 'Étudiant' : 'Enseignant'}</span>
            </div>
          )}
          {user && user.type === 'enseignant' && (
            <>
              <button className="btn btn-green" onClick={() => navigate('/enseignant/absences')}>Gérer les absences</button>
              <button className="btn btn-orange" onClick={() => navigate('/enseignant/justifications')}>Gérer les justifications</button>
            </>
          )}
          {user && user.type === 'etudiant' && (
            <button className="btn btn-orange" onClick={() => navigate('/etudiant/justifications')}>Mes justifications</button>
          )}
          <button className="btn btn-red" onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="recent-absences">
          <h2>Absences récentes</h2>
          {recentAbsences.length === 0 ? (
            <p className="no-absences">Aucune absence enregistrée</p>
          ) : (
            <table className="recent-absences-table">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>Séance</th>
                  <th>Date</th>
                  <th>Statut</th>
                  {user && user.type === 'enseignant' && <th>Justification</th>}
                </tr>
              </thead>
              <tbody>
                {recentAbsences.map((absence, idx) => {
                  const absenceId = absence._id;
                  const justification = justifications[absenceId];
                  const seanceDate = absence.seance?.date_seance 
                    ? new Date(absence.seance.date_seance) 
                    : (absence.seance?.date ? new Date(absence.seance.date) : null);

                  return (
                    <tr key={idx}>
                      <td>{absence.etudiant?.prenom} {absence.etudiant?.nom}</td>
                      <td>{absence.seance?.module?.nom_module || absence.seance?.module?.nom || 'N/A'}</td>
                      <td>{seanceDate ? seanceDate.toLocaleDateString('fr-FR') : 'N/A'}</td>
                      <td>
                        <span className={`badge ${absence.statut === 'absent' ? 'absent' : 'present'}`}>
                          {absence.statut === 'absent' ? 'Absent' : 'Présent'}
                        </span>
                      </td>
                      {user && user.type === 'enseignant' && (
                        <td>
                          {absence.statut === 'absent' ? (
                            justification ? (
                              <div className="justification-info">
                                <span className={`badge ${justification.etat === 'validé' ? 'justifie' : justification.etat === 'refusé' ? 'refuse' : 'attente'}`}>
                                  {justification.etat === 'validé' ? '✓ Justifié' : justification.etat === 'refusé' ? '✗ Refusé' : '⏳ En attente'}
                                </span>
                                {justification.commentaire && (
                                  <span className="justification-comment">
                                    "{justification.commentaire.substring(0, 50)}{justification.commentaire.length > 50 ? '...' : ''}"
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="badge absent">Non justifié</span>
                            )
                          ) : (
                            <span className="na">N/A</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
