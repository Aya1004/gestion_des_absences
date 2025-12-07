import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../App.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      // Essayer d'abord comme étudiant, puis comme enseignant
      let response;
      let userType = 'etudiant';
      let userData = null;

      // Essayer étudiant
      try {
        response = await fetch('/api/etudiants/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const data = await response.json();
          userData = { ...data.etudiant, type: 'etudiant' };
        }
      } catch (err) {
        console.log('Tentative étudiant échouée, essai enseignant...', err);
      }

      // Si étudiant n'a pas fonctionné, essayer enseignant
      if (!userData) {
        try {
          response = await fetch('/api/enseignants/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          if (response.ok) {
            const data = await response.json();
            userData = { ...data.enseignant, type: 'enseignant' };
          }
        } catch (err) {
          console.log('Tentative enseignant échouée', err);
        }
      }

      if (userData) {
        setSuccess(true);
        setMessage('Connexion réussie !');
        
        // Sauvegarder les infos utilisateur si "remember me" est coché
        if (remember) {
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('user', JSON.stringify(userData));
        }
        // Rediriger vers le dashboard
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setSuccess(false);
        setMessage('Email ou mot de passe incorrect.');
      }
    } catch (err) {
      setSuccess(false);
      const errorMsg = err.message || 'Erreur de connexion';
      setMessage(`Erreur: ${errorMsg}. Vérifiez que le backend est lancé sur le port 3000`);
      console.error('Erreur de connexion complète:', err);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Se connecter</h2>
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
          autoComplete="current-password"
          required
        />
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="remember"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
          />
          <label htmlFor="remember">
            Se souvenir de moi
          </label>
        </div>
        <button type="submit">
          Connexion
        </button>
        {message && (
          <div className={`message ${success ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        <div className="link-container">
          <Link to="/signup">
            Créer un compte
          </Link>
        </div>
      </form>
    </div>
  );
}
