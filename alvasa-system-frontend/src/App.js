import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Clientes from './components/clientes/Clientes';
import FormularioCotizacion from './components/cotizaciones/FormularioCotizacion';
import ListaCotizaciones from './components/cotizaciones/ListaCotizaciones';
import VerCotizacion from './components/cotizaciones/VerCotizacion';
import FormularioProcesoOperativo from './components/procesoOperativo/FormularioProcesoOperativo';
import ListaProcesosOperativos from './components/procesoOperativo/ListaProcesosOperativos';
import VerProcesoOperativo from './components/procesoOperativo/VerProcesoOperativo';


function App() {
  return (
    <Router>
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1" style={{ marginLeft: '250px', padding: '20px' }}>
          {/*<h1 className="titulo-principal mb-4">ALVASA SYSTEM</h1>*/}
          <Routes>
            <Route path="/" element={<Home />} />                                   
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/cotizaciones" element={<ListaCotizaciones />} />
            <Route path="/nuevacotizacion" element={<FormularioCotizacion />} />
            <Route path="/cotizaciones/:id" element={<VerCotizacion />} />
            <Route path="/cotizaciones/editar/:id" element={<FormularioCotizacion modo="editar" />} />
            <Route path="/procesos-operativos/nuevo" element={<FormularioProcesoOperativo />} />
            <Route path="/procesos-operativos" element={<ListaProcesosOperativos />} />
            <Route path="/procesos-operativos/:id" element={<VerProcesoOperativo />} />
          </Routes>
        </div>
      </div>

      {/* Notificaciones Toastify */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </Router>
  );
}

export default App;