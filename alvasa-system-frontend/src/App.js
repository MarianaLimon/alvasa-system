import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Clientes from './components/clientes/Clientes';
import FormularioCotizacion from './components/cotizaciones/FormularioCotizacion';

function App() {
  return (
    <Router>
      <div className="App">
        <div className="p-4">
          <h1 className="titulo-principal">ALVASA SYSTEM</h1>
          <Routes>
            <Route path="/" element={<h2 className="subtitulo">Clientes</h2>} />
            <Route path="/cotizaciones/nueva" element={<h2 className="subtitulo">Cotizaciones</h2>} />
          </Routes>
        </div>

        <Routes>
          <Route path="/" element={<Clientes />} />
          <Route path="/cotizaciones/nueva" element={<FormularioCotizacion />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;