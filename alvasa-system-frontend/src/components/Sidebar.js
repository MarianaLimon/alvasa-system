import React, { useEffect, useMemo, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BsCalculator, BsHouse, BsPeople, BsClipboard, BsBoxSeam,
  BsBriefcase, BsCashStack, BsDownload, BsPersonCircle, BsBoxArrowRight,
  BsShieldLock
} from 'react-icons/bs';

import { useAuth } from './usuarios/AuthContext';
import { logout } from './usuarios/auth';

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, setUser, hasPermission, loading } = useAuth() || {};

  const linkClass = ({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link');

  const canSeeUsuarios =
    (typeof hasPermission === 'function' && (hasPermission('USUARIOS_VER') || hasPermission('usuarios.read'))) ||
    (user?.role === 'MASTER' || user?.rol === 'MASTER');

  const grupos = useMemo(() => ({
    operaciones: [
      // ⬇️ FIX: estaba 'clients.read' (en inglés). Debe ser 'clientes.read'
      { to: '/clientes',            label: 'Clientes',          icon: <BsPeople className="icon" />,     perm: 'clientes.read' },
      { to: '/cotizaciones',        label: 'Cotizaciones',      icon: <BsCalculator className="icon" />, perm: 'cotizaciones.read' },
      { to: '/procesos-operativos', label: 'Alta de Embarques', icon: <BsBoxSeam className="icon" />,    perm: 'procesos.read' },
    ],
    finanzas: [
      { to: '/pagos-proveedores',      label: 'Proveedores',      icon: <BsClipboard className="icon" />, perm: 'pagos_proveedores.read' },
      { to: '/estado-cuenta-clientes', label: 'Edo Cta Clientes', icon: <BsClipboard className="icon" />, perm: 'estado_cuenta.read' },
      { to: '/data-export',            label: 'Data Export',      icon: <BsDownload  className="icon" />, perm: 'reportes.export' },
    ],
    administracion: canSeeUsuarios ? [
      { to: '/usuarios', label: 'Usuarios', icon: <BsShieldLock className="icon" />, perm: 'usuarios.read' },
    ] : []
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [canSeeUsuarios]);

  const opsVisible  = useMemo(() => grupos.operaciones.filter(it => hasPermission?.(it.perm)), [grupos, hasPermission]);
  const finVisible  = useMemo(() => grupos.finanzas.filter(it => hasPermission?.(it.perm)), [grupos, hasPermission]);
  const admVisible  = useMemo(() => grupos.administracion.filter(it => hasPermission?.(it.perm)), [grupos, hasPermission]);

  const [open, setOpen] = useState({ operaciones: false, finanzas: false, administracion: false });

  useEffect(() => {
    setOpen({
      operaciones:    opsVisible.some(it => pathname.startsWith(it.to)),
      finanzas:       finVisible.some(it => pathname.startsWith(it.to)),
      administracion: admVisible.some(it => pathname.startsWith(it.to)),
    });
  }, [pathname, opsVisible, finVisible, admVisible]);

  const handleLogout = async () => {
    await logout();
    setUser?.(null);
    navigate('/login');
  };

  return (
    <div className="sidebar d-flex flex-column" style={{ visibility: loading ? 'hidden' : 'visible' }}>
      {user && (
        <div className="sidebar-header-user">
          <BsPersonCircle size={32} style={{ marginRight: 10 }} />
          <div className="user-meta">
            <div className="user-name">{user?.nombre || 'Usuario'}</div>
            <div className="user-email">{user?.email || '—'}</div>
            <div className="user-role">{user?.role || user?.rol || '—'}</div>
          </div>
        </div>
      )}

      <Nav className="flex-column nav flex-grow-1">
        <NavLink to="/" className={linkClass} end>
          <BsHouse className="icon" /> Home
        </NavLink>

        {opsVisible.length > 0 && (
          <div className="sidebar-group">
            <button
              type="button"
              className={`sidebar-groupBtn ${open.operaciones ? 'is-open' : ''} ${opsVisible.some(it => pathname.startsWith(it.to)) ? 'is-active' : ''}`}
              onClick={() => setOpen(o => ({ ...o, operaciones: !o.operaciones }))}
              aria-expanded={open.operaciones}
              aria-controls="grp-operaciones"
            >
              <span className="icon"><BsBriefcase /></span>
              <span className="lbl">Operaciones</span>
              <span className="chev">{open.operaciones ? '▾' : '▸'}</span>
            </button>

            <div id="grp-operaciones" className={`sidebar-groupBody ${open.operaciones ? 'show' : ''}`}>
              {opsVisible.map(({ to, label, icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link sidebar-subitem ${isActive ? 'active' : ''}`}>
                  {icon} {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {finVisible.length > 0 && (
          <div className="sidebar-group">
            <button
              type="button"
              className={`sidebar-groupBtn ${open.finanzas ? 'is-open' : ''} ${finVisible.some(it => pathname.startsWith(it.to)) ? 'is-active' : ''}`}
              onClick={() => setOpen(o => ({ ...o, finanzas: !o.finanzas }))}
              aria-expanded={open.finanzas}
              aria-controls="grp-finanzas"
            >
              <span className="icon"><BsCashStack /></span>
              <span className="lbl">Finanzas</span>
              <span className="chev">{open.finanzas ? '▾' : '▸'}</span>
            </button>

            <div id="grp-finanzas" className={`sidebar-groupBody ${open.finanzas ? 'show' : ''}`}>
              {finVisible.map(({ to, label, icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link sidebar-subitem ${isActive ? 'active' : ''}`}>
                  {icon} {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {admVisible.length > 0 && (
          <div className="sidebar-group">
            <button
              type="button"
              className={`sidebar-groupBtn ${open.administracion ? 'is-open' : ''} ${admVisible.some(it => pathname.startsWith(it.to)) ? 'is-active' : ''}`}
              onClick={() => setOpen(o => ({ ...o, administracion: !o.administracion }))}
              aria-expanded={open.administracion}
              aria-controls="grp-administracion"
            >
              <span className="icon"><BsShieldLock /></span>
              <span className="lbl">Administración</span>
              <span className="chev">{open.administracion ? '▾' : '▸'}</span>
            </button>

            <div id="grp-administracion" className={`sidebar-groupBody ${open.administracion ? 'show' : ''}`}>
              {admVisible.map(({ to, label, icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link sidebar-subitem ${isActive ? 'active' : ''}`}>
                  {icon} {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </Nav>

      <div className="sidebar-user mt-auto p-3 ">
        <button className="btn btn-sm btn-outline-light w-100 d-flex align-items-center justify-content-center" onClick={handleLogout}>
          <BsBoxArrowRight style={{ marginRight: 6 }} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;