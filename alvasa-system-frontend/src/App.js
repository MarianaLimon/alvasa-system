import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Sidebar from './components/Sidebar';
import Clientes from './components/clientes/Clientes';
import FormularioCotizacion from './components/cotizaciones/FormularioCotizacion';
import ListaCotizaciones from './components/cotizaciones/ListaCotizaciones';
import VerCotizacion from './components/cotizaciones/VerCotizacion';

function App() {
  return (
    <Router>
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1" style={{ marginLeft: '250px', padding: '20px' }}>
          <h1 className="titulo-principal mb-4">ALVASA SYSTEM</h1>
          <Routes>
            <Route path="/" element={<div>Home Dashboard</div>} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/cotizaciones" element={<ListaCotizaciones />} />
            <Route path="/nuevacotizacion" element={<FormularioCotizacion />} />
            <Route path="/cotizaciones/:id" element={<VerCotizacion />} />
            <Route path="/cotizaciones/editar/:id" element={<FormularioCotizacion modo="editar" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;