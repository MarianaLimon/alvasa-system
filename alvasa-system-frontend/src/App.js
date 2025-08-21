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
import FormularioAsignacionCostos from './components/asignacionCostos/FormularioAsignacionCostos';
import VerAsignacionCostos from './components/asignacionCostos/VerAsignacionCostos';
import ListaPagosProveedores from './components/proveedores/ListaPagosProveedores';
import ListaAbonos from './components/proveedores/ListaAbonos';
import ListaEstadoCuentaClientes from './components/clientesEC/ListaEstadoCuentaClientes';
import ListaAbonosClientes from './components/clientesEC/ListaAbonosClientes'; 
import DataExport from './components/dataexport/DataExport';

function App() {
  return (
    <Router>
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1" style={{ marginLeft: '250px', padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />                                   
            <Route path="/clientes" element={<Clientes />} />

            {/* Cotizaciones */}
            <Route path="/cotizaciones" element={<ListaCotizaciones />} />
            <Route path="/nuevacotizacion" element={<FormularioCotizacion />} />
            <Route path="/cotizaciones/:id" element={<VerCotizacion />} />
            <Route path="/cotizaciones/editar/:id" element={<FormularioCotizacion modo="editar" />} />

            {/* Procesos operativos */}
            <Route path="/procesos-operativos/nuevo" element={<FormularioProcesoOperativo />} />
            <Route path="/procesos-operativos" element={<ListaProcesosOperativos />} />
            <Route path="/procesos-operativos/:id" element={<VerProcesoOperativo />} />
            <Route path="/procesos-operativos/editar/:id" element={<FormularioProcesoOperativo modo="editar" />} />

            {/* Asignación de costos */}
            <Route path="/asignacion-costos/nuevo" element={<FormularioAsignacionCostos modo="crear" />} />
            <Route path="/asignacion-costos/editar/:folio" element={<FormularioAsignacionCostos modo="editar" />} />
            <Route path="/asignacion-costos/ver/:folio" element={<VerAsignacionCostos />} />

            {/* Pagos proveedores */}
            <Route path="/pagos-proveedores" element={<ListaPagosProveedores />} />
            <Route path="/pagos-proveedores/:numero_control" element={<ListaAbonos />} />

            {/* Estado de cuenta clientes */}
            <Route path="/estado-cuenta-clientes" element={<ListaEstadoCuentaClientes />} />
            <Route path="/estado-cuenta/abonos/:numeroEstado" element={<ListaAbonosClientes />} /> 
            
            {/* Data Export */}
            <Route path="/data-export" element={<DataExport />} /> {/* ⬅️ NUEVO */}
          </Routes>
        </div>
      </div>

      {/* Notificaciones Toastify */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </Router>
  );
}

export default App;
