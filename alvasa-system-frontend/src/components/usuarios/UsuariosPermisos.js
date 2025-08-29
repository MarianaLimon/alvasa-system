import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import {
  Accordion,
  Badge,
  Form,
  InputGroup,
  Button,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { BsArrowClockwise, BsSearch } from "react-icons/bs";
import { useAuth } from "./AuthContext";        // 👈 Ajusta si tu ruta es distinta
import "./styles/permisos.css";

const SwitchPermiso = ({ id, checked, onChange, disabled, label, extraClass, tooltip }) => (
  <Form.Check
    type="switch"
    id={id}
    label={label}
    checked={!!checked}
    onChange={onChange}
    disabled={disabled}
    className={`mb-2 perm-switch ${extraClass || ""}`}
    // Tooltip instantáneo de tu sistema (si no edita)
    data-perm-tooltip={tooltip || ""}
  />
);

const UsuariosPermisos = () => {
  const { user: currentUser } = useAuth() || {};

  const [usuarios, setUsuarios] = useState([]);
  const [catalogo, setCatalogo] = useState([]);  // [{id, code, descripcion}]
  const [efectivos, setEfectivos] = useState({}); // { [userId]: Set(codes) }
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null); // "userId:code"
  const [filtro, setFiltro] = useState("");

  // Solo MASTER puede editar switches
  const isMaster = (currentUser?.role === "MASTER" || currentUser?.rol === "MASTER");
  const canEdit = isMaster;

  const cargar = async () => {
    setLoading(true);
    try {
      const [u, p] = await Promise.all([api.get("/usuarios"), api.get("/permisos")]);
      let users = u.data || [];

      // Si no eres MASTER, oculta al usuario MASTER
      if (!isMaster) {
        users = users.filter(x => (x.role || x.rol) !== "MASTER");
      }

      setUsuarios(users);
      setCatalogo(p.data || []);

      // Cargar permisos efectivos de todos los usuarios visibles
      const resultados = await Promise.all(
        users.map((usr) =>
          api.get(`/usuarios/${usr.id}/permisos-efectivos`).then((r) => [usr.id, r.data])
        )
      );
      const mapa = {};
      for (const [id, perms] of resultados) {
        mapa[id] = new Set((perms || []).map((x) => x.code));
      }
      setEfectivos(mapa);
    } catch (e) {
      console.error("Error cargando usuarios/permisos:", e);
      alert("No se pudieron cargar usuarios y permisos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMaster]); // si cambia el rol, recargar

  const listaFiltrada = useMemo(() => {
    const q = (filtro || "").trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) =>
      `${u.nombre || ""} ${u.email || ""}`.toLowerCase().includes(q)
    );
  }, [usuarios, filtro]);

  const togglePermiso = async (userId, code, enabled) => {
    if (!canEdit) return; // Admin no puede editar
    const key = `${userId}:${code}`;
    setSavingKey(key);

    // Optimista
    const prev = efectivos[userId] ? new Set(efectivos[userId]) : new Set();
    const next = new Set(prev);
    if (enabled) next.add(code);
    else next.delete(code);
    setEfectivos({ ...efectivos, [userId]: next });

    try {
      await api.put(`/usuarios/${userId}/permisos`, { code, enabled });
    } catch (e) {
      console.error("Error actualizando permiso:", e);
      alert("No se pudo guardar el permiso, revirtiendo cambios.");
      setEfectivos({ ...efectivos, [userId]: prev }); // rollback
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="container-fluid">
      <Row className="align-items-center mb-3 usuarios-toolbar header-permisos">
        <Col xs="12" md="6">
          <h4 className="mb-0 title">Usuarios y permisos</h4>
          <small className="text-header">
            {canEdit ? "Enciende/apaga permisos por usuario." : "Vista de solo lectura."}
          </small>
        </Col>
        <Col xs="12" md="4" className="mt-2 mt-md-0">
          <InputGroup className="search-bar">
            <Form.Control
              placeholder="Buscar por nombre o email…"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
            <Button className="search-btn" onClick={() => { /* no-op */ }}>
              <BsSearch />
            </Button>
          </InputGroup>
        </Col>
        <Col xs="12" md="2" className="mt-2 mt-md-0 text-md-end">
          <Button variant="outline-secondary" onClick={cargar}>
            <BsArrowClockwise className="me-1" />
            Recargar
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="d-flex align-items-center">
          <Spinner animation="border" size="sm" className="me-2" />
          Cargando…
        </div>
      ) : (
        <Accordion alwaysOpen className="usuarios-accordion">
          {listaFiltrada.map((u, idx) => {
            const activos = efectivos[u.id] || new Set();

            return (
              <Accordion.Item eventKey={String(idx)} key={u.id}>
                <Accordion.Header>
                  <div className="d-flex flex-column flex-md-row w-100">
                    <div className="me-auto">
                      <strong className="me-2">{u.nombre || "(Sin nombre)"}</strong> | 
                      <span>&nbsp;&nbsp;&nbsp;{u.email}</span>
                    </div>
                    <div className="usuarios-header-meta">
                      <Badge className="rol-badge ms-md-2">{u.rol || u.role}</Badge>
                      <Badge className="count-badge ms-1">{activos.size} permisos</Badge>
                    </div>
                  </div>
                </Accordion.Header>

                <Accordion.Body>
                  {catalogo.length === 0 ? (
                    <div className="text-muted">No hay catálogo de permisos.</div>
                  ) : (
                    <Row>
                      {catalogo.map(({ id, code, descripcion }) => {
                        const key = `${u.id}:${code}`;
                        const disabled = !canEdit || savingKey === key;

                        // Si no puede editar, dejamos el switch deshabilitado + tooltip rojo de tu sistema
                        const extraClass = !canEdit
                          ? "perm-has-tooltip tooltip-right perm-disabled"
                          : "";

                        const tooltipText = !canEdit
                          ? "Solo MASTER puede editar permisos"
                          : "";

                        return (
                          <Col xs={12} md={6} lg={4} key={`${u.id}-${id}`}>
                            <SwitchPermiso
                              id={`sw-${u.id}-${code}`}               // id único y sin espacios
                              label={descripcion || code}
                              checked={activos.has(code)}
                              disabled={disabled}
                              extraClass={extraClass}
                              tooltip={tooltipText}
                              onChange={disabled ? undefined : (e) =>
                                togglePermiso(u.id, code, e.target.checked)
                              }
                            />
                          </Col>
                        );
                      })}
                    </Row>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            );
          })}

          {listaFiltrada.length === 0 && (
            <div className="text-muted">Sin resultados para “{filtro}”.</div>
          )}
        </Accordion>
      )}
    </div>
  );
};

export default UsuariosPermisos;
