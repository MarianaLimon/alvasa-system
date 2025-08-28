import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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

import { AuthProvider } from './components/usuarios/AuthContext';
import { useAuth } from './components/usuarios/AuthContext';
import Login from './components/usuarios/Login';
import PrivateRoute from './components/usuarios/PrivateRoute';
import UsuariosPermisos from './components/usuarios/UsuariosPermisos';

function Shell() {
  const location = useLocation();
  const hideSidebar = location.pathname === '/login';
  const { loading } = useAuth();

   if (loading) return null; // o un spinner global

  return (
    <>
      <div className="d-flex">
        {!hideSidebar && <Sidebar />}
        <div className="flex-grow-1" style={{ marginLeft: hideSidebar ? 0 : '250px', padding: '20px' }}>
          <Routes>
            {/* Pública */}
            <Route path="/login" element={<Login />} />

            {/* Privadas */}
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />

            {/* Clientes */}
            <Route path="/clientes" element={<PrivateRoute require="clients.read"><Clientes /></PrivateRoute>} />

            {/* Cotizaciones */}
            <Route path="/cotizaciones" element={<PrivateRoute require="cotizaciones.read"><ListaCotizaciones /></PrivateRoute>} />
            <Route path="/cotizaciones/:id" element={<PrivateRoute require="cotizaciones.read"><VerCotizacion /></PrivateRoute>} />
            <Route path="/nuevacotizacion" element={<PrivateRoute require="cotizaciones.write"><FormularioCotizacion /></PrivateRoute>} />
            <Route path="/cotizaciones/editar/:id" element={<PrivateRoute require="cotizaciones.write"><FormularioCotizacion modo="editar" /></PrivateRoute>} />

            {/* Procesos operativos */}
            <Route path="/procesos-operativos" element={<PrivateRoute require="procesos.read"><ListaProcesosOperativos /></PrivateRoute>} />
            <Route path="/procesos-operativos/:id" element={<PrivateRoute require="procesos.read"><VerProcesoOperativo /></PrivateRoute>} />
            <Route path="/procesos-operativos/nuevo" element={<PrivateRoute require="procesos.write"><FormularioProcesoOperativo /></PrivateRoute>} />
            <Route path="/procesos-operativos/editar/:id" element={<PrivateRoute require="procesos.write"><FormularioProcesoOperativo modo="editar" /></PrivateRoute>} />

            {/* Asignación de costos */}
            <Route path="/asignacion-costos/ver/:folio" element={<PrivateRoute require="asignacion_costos.read"><VerAsignacionCostos /></PrivateRoute>} />
            <Route path="/asignacion-costos/nuevo" element={<PrivateRoute require="asignacion_costos.write"><FormularioAsignacionCostos modo="crear" /></PrivateRoute>} />
            <Route path="/asignacion-costos/editar/:folio" element={<PrivateRoute require="asignacion_costos.write"><FormularioAsignacionCostos modo="editar" /></PrivateRoute>} />

            {/* Pagos proveedores */}
            <Route path="/pagos-proveedores" element={<PrivateRoute require="pagos_proveedores.read"><ListaPagosProveedores /></PrivateRoute>} />
            <Route path="/pagos-proveedores/:numero_control" element={<PrivateRoute require="pagos_proveedores.read"><ListaAbonos /></PrivateRoute>} />

            {/* Estado de cuenta clientes */}
            <Route path="/estado-cuenta-clientes" element={<PrivateRoute require="estado_cuenta.read"><ListaEstadoCuentaClientes /></PrivateRoute>} />
            <Route path="/estado-cuenta/abonos/:numeroEstado" element={<PrivateRoute require="estado_cuenta.read"><ListaAbonosClientes /></PrivateRoute>} />

            {/* Reportes */}
            <Route path="/data-export" element={<PrivateRoute require="reportes.export"><DataExport /></PrivateRoute>} />

            {/* Usuarios */}
            <Route path="/usuarios" element={<PrivateRoute require="usuarios.read"><UsuariosPermisos /></PrivateRoute>} />

            {/* 403 */}
            <Route path="/403" element={<div>403 — Sin permisos</div>} />
          </Routes>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </Router>
  );
}
