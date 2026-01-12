// src/App.js
import React, { useState, useEffect } from 'react';
import Login from './Login';
import VelibMap from './Map';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <header className="app-header">
            <h1>🚴 Bornes Vélib Paris</h1>
            <button onClick={handleLogout} className="logout-btn">
              Déconnexion
            </button>
          </header>
          <VelibMap token={token} />
        </>
      )}
    </div>
  );
}

export default App;