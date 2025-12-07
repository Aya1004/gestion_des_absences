import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EnseignantJustifications.css';

export default function EnseignantJustificationsPage() {
  const [user, setUser] = useState(null);
  const [justifications, setJustifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
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
    loadJustifications(parsedUser);
  }, [navigate]);

  const loadJustifications = async (enseignant) => {
    try {
      const res = await fetch('/api/justifications');
      if (res.ok) {
        const allJustifications = await res.json();
        const enseignantId = String(enseignant.id || enseignant._id);
        const enseignantClasses = enseignant.classes?.map(c => typeof c === 'string' ? c : c._id || c.id || String(c)).map(String) || [];
        const justifFiltered = allJustifications.filter(j => {
          if (!j.absence || j.absence.statut !== 'absent') return false;
          if (!j.absence.seance) return false;
          let seanceEnseignantId = j.absence.seance.enseignant ? (typeof j.absence.seance.enseignant === 'string' ? j.absence.seance.enseignant : j.absence.seance.enseignant._id || j.absence.seance.enseignant.id || String(j.absence.seance.enseignant)) : null;
          seanceEnseignantId = seanceEnseignantId ? String(seanceEnseignantId) : null;
          let seanceClasseId = j.absence.seance.classe ? (typeof j.absence.seance.classe === 'string' ? j.absence.seance.classe : j.absence.seance.classe._id || j.absence.seance.classe.id || String(j.absence.seance.classe)) : null;
          seanceClasseId = seanceClasseId ? String(seanceClasseId) : null;
          const matchesEnseignant = seanceEnseignantId === enseignantId;
          const matchesClasse = enseignantClasses.length > 0 && seanceClasseId && enseignantClasses.includes(seanceClasseId);
          return enseignantClasses.length === 0 ? matchesEnseignant : matchesEnseignant || matchesClasse;
        });
        justifFiltered.sort((a, b) => {
          const dateA = a.absence?.seance?.date_seance ? new Date(a.absence.seance.date_seance) : (a.absence?.seance?.date ? new Date(a.absence.seance.date) : 0);
          const dateB = b.absence?.seance?.date_seance ? new Date(b.absence.seance.date_seance) : (b.absence?.seance?.date ? new Date(b.absence.seance.date) : 0);
          return dateB - dateA;
        });
        setJustifications(justifFiltered);
      }
    } catch (err) {
      console.error(err);
      setMessage('Erreur lors du chargement des justifications.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEtat = async (justificationId, nouvelEtat) => {
    try {
      const response = await fetch(`/api/justifications/${justificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etat: nouvelEtat })
      });

      if (response.ok) {
        setSuccess(true);
        setMessage(`Justification ${nouvelEtat === 'validé' ? 'validée' : 'refusée'} avec succès !`);
        await loadJustifications(user);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setSuccess(false);
        setMessage(errorData.message || 'Erreur lors de la mise à jour.');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (err) {
      setSuccess(false);
      setMessage('Erreur de connexion au serveur.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const getEtatColor = (etat) => {
    switch (etat) {
      case 'validé': return 'etat-valide';
      case 'refusé': return 'etat-refuse';
      default: return 'etat-attente';
    }
  };

  const getEtatLabel = (etat) => {
    switch (etat) {
      case 'validé': return 'Validé';
      case 'refusé': return 'Refusé';
      default: return 'En attente';
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (!user) return null;

  const justificationsEnAttente = justifications.filter(j => j.etat === 'en attente');
  const justificationsTraitees = justifications.filter(j => j.etat !== 'en attente');

  return (
    <div className="enseignant-justifications-page">
      <header className="header">
        <h1>Gestion des justifications</h1>
        <button className="btn-back" onClick={() => navigate('/dashboard')}>Retour au tableau de bord</button>
      </header>

      <div className="container">
        {message && <div className={`message ${success ? 'success' : 'error'}`}>{message}</div>}

        {justificationsEnAttente.length > 0 && (
          <div className="card">
            <h2>Justifications en attente ({justificationsEnAttente.length})</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>Date absence</th>
                    <th>Module</th>
                    <th>Commentaire</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {justificationsEnAttente.map(j => {
                    const absence = j.absence;
                    const seanceDate = absence?.seance?.date_seance ? new Date(absence.seance.date_seance) : (absence?.seance?.date ? new Date(absence.seance.date) : null);
                    return (
                      <tr key={j._id}>
                        <td>{absence?.etudiant?.prenom} {absence?.etudiant?.nom}</td>
                        <td>{seanceDate ? seanceDate.toLocaleDateString('fr-FR') : 'N/A'}</td>
                        <td>{absence?.seance?.module?.nom_module || absence?.seance?.module?.nom || 'N/A'}</td>
                        <td>{j.commentaire || '-'}</td>
                        <td className="actions">
                          <button className="btn-validate" onClick={() => handleUpdateEtat(j._id, 'validé')}>Valider</button>
                          <button className="btn-refuse" onClick={() => handleUpdateEtat(j._id, 'refusé')}>Refuser</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {justificationsTraitees.length > 0 && (
          <div className="card">
            <h2>Justifications traitées ({justificationsTraitees.length})</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>Date absence</th>
                    <th>Module</th>
                    <th>Commentaire</th>
                    <th>État</th>
                  </tr>
                </thead>
                <tbody>
                  {justificationsTraitees.map(j => {
                    const absence = j.absence;
                    const seanceDate = absence?.seance?.date_seance ? new Date(absence.seance.date_seance) : (absence?.seance?.date ? new Date(absence.seance.date) : null);
                    return (
                      <tr key={j._id}>
                        <td>{absence?.etudiant?.prenom} {absence?.etudiant?.nom}</td>
                        <td>{seanceDate ? seanceDate.toLocaleDateString('fr-FR') : 'N/A'}</td>
                        <td>{absence?.seance?.module?.nom_module || absence?.seance?.module?.nom || 'N/A'}</td>
                        <td>{j.commentaire || '-'}</td>
                        <td><span className={`etat ${getEtatColor(j.etat)}`}>{getEtatLabel(j.etat)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {justifications.length === 0 && !loading && (
          <div className="card no-justifications">
            <p>Aucune justification à traiter</p>
            {user?.classes?.length === 0 && <p className="warning">Vous n'avez aucune classe assignée. Veuillez contacter l'administrateur.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
