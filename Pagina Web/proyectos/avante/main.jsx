import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AvantePlataforma from './avante_plataforma.jsx';

window.storage = {
  async get(key) {
    const value = localStorage.getItem(key);
    return value !== null ? { value } : null;
  },
  async set(key, value) {
    localStorage.setItem(key, value);
  },
  async delete(key) {
    localStorage.removeItem(key);
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AvantePlataforma />
  </React.StrictMode>
);
