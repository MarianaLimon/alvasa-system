import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import {
  BsHouse,
  BsPeople,
  BsClipboard,
  BsPlus,
  BsClock
} from 'react-icons/bs';

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
          <BsClipboard className="icon" /> Lista de Cotizaciones
        </NavLink>
        <NavLink to="/nuevacotizacion" className={linkClass}>
          <BsPlus className="icon" /> Nueva Cotización
        </NavLink>
        <div className="sidebar-link disabled">
          <BsClock className="icon" /> Próximamente
        </div>
      </Nav>
    </div>
  );
};

export default Sidebar;