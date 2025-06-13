import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import {BsCalculator, BsHouse, BsPeople, BsClipboard} from 'react-icons/bs';

const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    isActive ? 'sidebar-link active' : 'sidebar-link';

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h4>ALVASA SYSTEM</h4>
      </div>
      <Nav className="flex-column nav">
        <NavLink to="/" className={linkClass} end>
          <BsHouse className="icon" /> Home
        </NavLink>
        <NavLink to="/clientes" className={linkClass}>
          <BsPeople className="icon" /> Clientes
        </NavLink>
        <NavLink to="/cotizaciones" className={linkClass}>
          <BsCalculator className="icon" /> Cotizaciones
        </NavLink>
        {/* <NavLink to="/nuevacotizacion" className={linkClass}>
          <BsPlus className="icon" /> Nueva Cotización
        </NavLink> */}
        <NavLink to="/procesos-operativos" className={linkClass} end>
          <BsClipboard className="icon" /> Procesos Operativos
        </NavLink>
        {/* <NavLink to="/procesos-operativos/nuevo" className={linkClass}>
          <BsPlus className="icon" /> Nuevo Proceso
        </NavLink> 
        <NavLink to="/asignacion-costos/nuevo" className={linkClass}>
          <BsPlus className="icon" /> Nueva Asignación
        </NavLink>*/}
      </Nav>
    </div>
  );
};

export default Sidebar;