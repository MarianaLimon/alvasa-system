import React from 'react';
import { Nav } from 'react-bootstrap';

const Sidebar = () => {
  const handleNavigation = (path) => {
    window.location.href = path;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h4>ALVASA SYSTEM</h4>
      </div>
      <Nav className="flex-column p-3">
        <Nav.Link className="sidebar-link" onClick={() => handleNavigation('/')}>
          🏠 Home
        </Nav.Link>
        <Nav.Link className="sidebar-link" onClick={() => handleNavigation('/clientes')}>
          👥 Clientes
        </Nav.Link>
        <Nav.Link className="sidebar-link" onClick={() => handleNavigation('/cotizaciones')}>
          📋 Lista de Cotizaciones
        </Nav.Link>
        <Nav.Link className="sidebar-link" onClick={() => handleNavigation('/nuevacotizacion')}>
          ➕ Nueva Cotización
        </Nav.Link>
        <Nav.Link className="sidebar-link disabled">
          🔜 Próximamente
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;