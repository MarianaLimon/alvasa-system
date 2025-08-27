import React, { useEffect, useMemo, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BsCalculator,
  BsHouse,
  BsPeople,
  BsClipboard,
  BsBoxSeam,
  BsBriefcase,
  BsCashStack,
  BsDownload,
  BsPersonCircle,
  BsBoxArrowRight
} from 'react-icons/bs';

// 👇 Ajustados a tu estructura real
import { useAuth } from './usuarios/AuthContext';
import { logout } from './usuarios/auth';

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const linkClass = ({ isActive }) =>
    isActive ? 'sidebar-link active' : 'sidebar-link';

  const grupos = useMemo(() => ({
    operaciones: [
      { to: '/clientes',              label: 'Clientes',           icon: <BsPeople className="icon" /> },
      { to: '/cotizaciones',          label: 'Cotizaciones',       icon: <BsCalculator className="icon" /> },
      { to: '/procesos-operativos',   label: 'Alta de Embarques',  icon: <BsBoxSeam className="icon" /> },
    ],
    finanzas: [
      { to: '/pagos-proveedores',      label: 'Proveedores',        icon: <BsClipboard className="icon" /> },
      { to: '/estado-cuenta-clientes', label: 'Edo Cta Clientes',   icon: <BsClipboard className="icon" /> },
      { to: '/data-export',            label: 'Data Export',        icon: <BsDownload  className="icon" /> },
    ]
  }), []);

  const [open, setOpen] = useState({ operaciones: false, finanzas: false });

  useEffect(() => {
    setOpen({
      operaciones: grupos.operaciones.some(it => pathname.startsWith(it.to)),
      finanzas:    grupos.finanzas.some(it => pathname.startsWith(it.to)),
    });
  }, [pathname, grupos]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="sidebar d-flex flex-column">
      <div className="sidebar-header">
        <h4>ALVASA SYSTEM</h4>
      </div>

      <Nav className="flex-column nav flex-grow-1">
        {/* Home */}
        <NavLink to="/" className={linkClass} end>
          <BsHouse className="icon" /> Home
        </NavLink>

        {/* Operaciones */}
        <div className="sidebar-group">
          <button
            type="button"
            className={`sidebar-groupBtn ${open.operaciones ? 'is-open' : ''} ${grupos.operaciones.some(it => pathname.startsWith(it.to)) ? 'is-active' : ''}`}
            onClick={() => setOpen(o => ({ ...o, operaciones: !o.operaciones }))}
            aria-expanded={open.operaciones}
            aria-controls="grp-operaciones"
          >
            <span className="icon"><BsBriefcase /></span>
            <span className="lbl">Operaciones</span>
            <span className="chev">{open.operaciones ? '▾' : '▸'}</span>
          </button>

          <div id="grp-operaciones" className={`sidebar-groupBody ${open.operaciones ? 'show' : ''}`}>
            {grupos.operaciones.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `sidebar-link sidebar-subitem ${isActive ? 'active' : ''}`}
              >
                {icon} {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Finanzas */}
        <div className="sidebar-group">
          <button
            type="button"
            className={`sidebar-groupBtn ${open.finanzas ? 'is-open' : ''} ${grupos.finanzas.some(it => pathname.startsWith(it.to)) ? 'is-active' : ''}`}
            onClick={() => setOpen(o => ({ ...o, finanzas: !o.finanzas }))}
            aria-expanded={open.finanzas}
            aria-controls="grp-finanzas"
          >
            <span className="icon"><BsCashStack /></span>
            <span className="lbl">Finanzas</span>
            <span className="chev">{open.finanzas ? '▾' : '▸'}</span>
          </button>

          <div id="grp-finanzas" className={`sidebar-groupBody ${open.finanzas ? 'show' : ''}`}>
            {grupos.finanzas.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `sidebar-link sidebar-subitem ${isActive ? 'active' : ''}`}
              >
                {icon} {label}
              </NavLink>
            ))}
          </div>
        </div>
      </Nav>

      {/* === Usuario + Logout === */}
      {user && (
        <div className="sidebar-user mt-auto p-3 border-top">
          <div className="d-flex align-items-center mb-2">
            <BsPersonCircle size={22} style={{ marginRight: 8 }} />
            <div>
              <div className="fw-bold">{user?.nombre || 'Usuario'}</div>
              <div className="small text-muted">{user?.email}</div>
            </div>
          </div>
          <button
            className="btn btn-sm btn-outline-light w-100 d-flex align-items-center justify-content-center"
            onClick={handleLogout}
          >
            <BsBoxArrowRight style={{ marginRight: 6 }} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
