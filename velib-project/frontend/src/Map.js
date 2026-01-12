// src/Map.js
import React, { useState, useEffect } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoieWJvdXJhZ2hkYSIsImEiOiJjbWsxMXB2MTMwMTUxM3NxeDNidnhudmp3In0.UuYNv8tPStrK75eKbELoxA'; 

function VelibMap({ token }) {
  const [stations, setStations] = useState([]);
  
  const [viewport, setViewport] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
    zoom: 13
  });

  const [selectedStation, setSelectedStation] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  
  // --- NOUVEAU : On stocke l'ID à part pour éviter le bug si la popup se ferme ---
  const [editId, setEditId] = useState(null); 
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    latitude: 48.8566,
    longitude: 2.3522,
    nbBikes: 0,
    nbEBikes: 0,
    nbFreeDocks: 0,
    status: 'Operative'
  });

  useEffect(() => {
    fetchStations();
    // eslint-disable-next-line
  }, [viewport.latitude, viewport.longitude]);

  const fetchStations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stations', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          lat: viewport.latitude,
          lng: viewport.longitude,
          radius: 5000
        }
      });
      setStations(response.data);
    } catch (error) {
      console.error('Erreur de récupération:', error);
    }
  };

  const handleCreateStation = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/stations', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateForm(false);
      fetchStations();
      resetForm();
    } catch (error) {
      alert('Erreur lors de la création');
    }
  };

  const handleUpdateStation = async (e) => {
    e.preventDefault();
    try {
      // ✅ CORRECTION DU BUG : On utilise editId au lieu de selectedStation.id
      // Comme ça, même si la popup est fermée, ça marche !
      await axios.put(
        `http://localhost:5000/api/stations/${editId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditMode(false);
      setEditId(null);
      setSelectedStation(null);
      fetchStations();
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteStation = async (id) => {
    if (window.confirm('Supprimer cette station ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/stations/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSelectedStation(null);
        fetchStations();
      } catch (error) {
        console.error(error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      latitude: viewport.latitude,
      longitude: viewport.longitude,
      nbBikes: 0,
      nbEBikes: 0,
      nbFreeDocks: 0,
      status: 'Operative'
    });
  };

  const startEdit = (station) => {
    // ✅ Sauvegarde l'ID tout de suite !
    setEditId(station.id); 
    
    setFormData({
      code: station.code,
      name: station.name,
      latitude: station.latitude,
      longitude: station.longitude,
      nbBikes: station.nbBikes,
      nbEBikes: station.nbEBikes,
      nbFreeDocks: station.nbFreeDocks,
      status: station.status
    });
    setEditMode(true);
  };

  return (
    <div className="map-container">
      {/* --- PANNEAU DE GAUCHE --- */}
      <div className="controls-panel">
        <input
          type="text"
          placeholder="Rechercher une adresse à Paris..."
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          className="search-input"
        />
        
        <button 
          onClick={() => {
             setShowCreateForm(!showCreateForm);
             setEditMode(false);
             resetForm();
          }}
          className="create-btn"
        >
          {showCreateForm ? 'Annuler' : '➕ Nouvelle Station'}
        </button>

        {(showCreateForm || editMode) && (
          <form onSubmit={editMode ? handleUpdateStation : handleCreateStation} className="station-form">
            <h3>{editMode ? 'Modifier' : 'Créer'} une station</h3>
            
            {/* Note: Le code est souvent unique, on le désactive en modification */}
            <input type="text" placeholder="Code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} disabled={editMode} required />
            <input type="text" placeholder="Nom" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            <input type="number" step="0.000001" placeholder="Latitude" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})} required />
            <input type="number" step="0.000001" placeholder="Longitude" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})} required />
            <input type="number" placeholder="Vélos" value={formData.nbBikes} onChange={(e) => setFormData({...formData, nbBikes: parseInt(e.target.value)})} />
            <input type="number" placeholder="E-bikes" value={formData.nbEBikes} onChange={(e) => setFormData({...formData, nbEBikes: parseInt(e.target.value)})} />
            <input type="number" placeholder="Places" value={formData.nbFreeDocks} onChange={(e) => setFormData({...formData, nbFreeDocks: parseInt(e.target.value)})} />
            
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
              <option value="Operative">Operative</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Closed">Closed</option>
            </select>
            
            <button type="submit">{editMode ? 'Modifier' : 'Créer'}</button>
            {editMode && (
                <button type="button" onClick={() => {
                    setEditMode(false);
                    setEditId(null);
                    resetForm();
                }}>
                    Annuler
                </button>
            )}
          </form>
        )}

        <div className="stats">
          <p>📍 {stations.length} stations à proximité</p>
        </div>
      </div>

      {/* --- ZONE DE CARTE (DROITE) --- */}
      <div className="map-display-area">
        <ReactMapGL
          {...viewport}
          width="100%"
          height="100%"
          onViewportChange={nextViewport => setViewport(nextViewport)}
          mapStyle="mapbox://styles/mapbox/streets-v11" 
          mapboxApiAccessToken={MAPBOX_TOKEN}
        >
          {stations.map(station => (
            <Marker
              key={station.id} 
              latitude={station.latitude}
              longitude={station.longitude}
            >
              <div 
                className={`marker ${station.status.toLowerCase()}`}
                onClick={() => setSelectedStation(station)}
              >
                🚴
              </div>
            </Marker>
          ))}

          {selectedStation && (
            <Popup
              latitude={selectedStation.latitude}
              longitude={selectedStation.longitude}
              onClose={() => setSelectedStation(null)}
              closeOnClick={false}
            >
              <div className="popup-content">
                <h4>{selectedStation.name}</h4>
                <p><strong>Code:</strong> {selectedStation.code}</p>
                <p>🚴 Vélos: {selectedStation.nbBikes}</p>
                <p>⚡ E-bikes: {selectedStation.nbEBikes}</p>
                <p>🅿️ Places: {selectedStation.nbFreeDocks}</p>
                <p><strong>Status:</strong> {selectedStation.status}</p>
                
                <div className="popup-actions">
                  <button onClick={() => startEdit(selectedStation)}>✏️ Modifier</button>
                  <button 
                    onClick={() => handleDeleteStation(selectedStation.id)} 
                    className="delete-btn"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            </Popup>
          )}
        </ReactMapGL>
      </div>
    </div>
  );
}

export default VelibMap;