import React, { useState, useEffect } from 'react';
import '../../App.css';

export default function SignupForm() {
  const [userType, setUserType] = useState('etudiant'); // 'etudiant' ou 'enseignant'
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [classe, setClasse] = useState(''); // Pour étudiant
  const [telephone, setTelephone] = useState(''); // Pour enseignant
  const [selectedClasses, setSelectedClasses] = useState([]); // Pour enseignant (multiples)
  const [classes, setClasses] = useState([]);
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Charger les classes disponibles
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(err => console.error('Erreur chargement classes:', err));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    if (!agree) {
      setSuccess(false);
      setMessage("Vous devez accepter les conditions générales d'utilisation.");
      return;
    }
    if (userType === 'etudiant' && !classe) {
      setSuccess(false);
      setMessage('Veuillez sélectionner une classe.');
      return;
    }
    if (userType === 'enseignant' && !telephone) {
      setSuccess(false);
      setMessage('Veuillez saisir votre numéro de téléphone.');
      return;
    }
    try {
      let endpoint = '/api/etudiants';
      let body = { nom, prenom, email, password };
      
      if (userType === 'etudiant') {
        body.classe = classe;
      } else {
        endpoint = '/api/enseignants';
        body.telephone = telephone;
        body.classes = selectedClasses;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        setSuccess(true);
        setMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setNom(''); setPrenom(''); setEmail(''); setPassword(''); 
        setClasse(''); setTelephone(''); setSelectedClasses([]); setAgree(false);
      } else {
        const data = await response.json();
        setSuccess(false);
        setMessage(data.message || "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch (err) {
      setSuccess(false);
      setMessage('Erreur de connexion au serveur.');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Créer un compte</h2>
        
        <label htmlFor="userType">Type de compte</label>
        <select
          id="userType"
          value={userType}
          onChange={e => {
            setUserType(e.target.value);
            setClasse('');
            setTelephone('');
            setSelectedClasses([]);
          }}
          required
        >
          <option value="etudiant">Étudiant</option>
          <option value="enseignant">Enseignant</option>
        </select>
        
        <label htmlFor="nom">Nom</label>
        <input
          type="text"
          id="nom"
          placeholder="Votre nom"
          value={nom}
          onChange={e => setNom(e.target.value)}
          autoComplete="family-name"
          required
        />
        
        <label htmlFor="prenom">Prénom</label>
        <input
          type="text"
          id="prenom"
          placeholder="Votre prénom"
          value={prenom}
          onChange={e => setPrenom(e.target.value)}
          autoComplete="given-name"
          required
        />
        
        <label htmlFor="email">Adresse Email</label>
        <input
          type="email"
          id="email"
          placeholder="votre.email@exemple.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="username"
          required
        />
        
        <label htmlFor="password">Mot de passe</label>
        <input
          type="password"
          id="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        
        {userType === 'etudiant' ? (
          <>
            <label htmlFor="classe">Classe</label>
            <select
              id="classe"
              value={classe}
              onChange={e => setClasse(e.target.value)}
              required
            >
              <option value="">Sélectionnez une classe</option>
              {classes.map(cl => (
                <option key={cl._id} value={cl._id}>
                  {cl.nom_classe || `${cl.niveau} - ${cl.filiere}`}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label htmlFor="telephone">Téléphone</label>
            <input
              type="tel"
              id="telephone"
              placeholder="+33 6 12 34 56 78"
              value={telephone}
              onChange={e => setTelephone(e.target.value)}
              autoComplete="tel"
              required
            />
            <label htmlFor="classes">Classes enseignées (optionnel)</label>
            <select
              id="classes"
              multiple
              value={selectedClasses}
              onChange={e => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedClasses(values);
              }}
              style={{ minHeight: '100px' }}
            >
              {classes.map(cl => (
                <option key={cl._id} value={cl._id}>
                  {cl.nom_classe || `${cl.niveau} - ${cl.filiere}`}
                </option>
              ))}
            </select>
            <small>Maintenez Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs classes</small>
          </>
        )}
        
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="agree"
            checked={agree}
            onChange={e => setAgree(e.target.checked)}
          />
          <label htmlFor="agree">
            J'accepte les conditions générales d'utilisation
          </label>
        </div>
        
        <button type="submit">
          Créer mon compte
        </button>
        
        {message && (
          <div className={`message ${success ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
