import React from 'react';
import ReactDOM from 'react-dom/client';

import '@fortawesome/fontawesome-free/css/all.min.css';

import { BrowserRouter } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import App from './App';
import './index.css';
import './css/universais/Movimento.css';
import axios from 'axios';
import { observarAcoes } from './utils/notificacoes';

// ações que mudam dados atualizam o sino na hora
observarAcoes(axios);

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);