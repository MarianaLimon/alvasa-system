import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Clientes from './components/clientes/Clientes';
import FormularioCotizacion from './components/cotizaciones/FormularioCotizacion';
import ListaCotizaciones from './components/cotizaciones/ListaCotizaciones';
import VerCotizacion from './components/cotizaciones/VerCotizacion';

function App() {
  return (
    <Router>
      <div className="App p-4">
        <h1 className="titulo-principal">ALVASA SYSTEM</h1>
        <Routes>
          <Route path="/" element={<Clientes />} />
          <Route path="/cotizaciones" element={<ListaCotizaciones />} />
          <Route path="/nuevacotizacion" element={<FormularioCotizacion />} />
          <Route path="/cotizaciones/:id" element={<VerCotizacion />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;