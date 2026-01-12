// src/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isRegister ? '/api/register' : '/api/login';
      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        username,
        password
      });

      if (isRegister) {
        setIsRegister(false);
        setError('Compte créé ! Connectez-vous maintenant.');
      } else {
        onLogin(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>🚴 Vélib Manager</h2>
        <h3>{isRegister ? 'Créer un compte' : 'Connexion'}</h3>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && <p className="error">{error}</p>}
          
          <button type="submit">
            {isRegister ? "S'inscrire" : 'Se connecter'}
          </button>
        </form>

        <p className="toggle-mode">
          {isRegister ? 'Déjà un compte ?' : 'Pas de compte ?'}
          <button onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Se connecter' : "S'inscrire"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;