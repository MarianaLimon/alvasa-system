import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, Table, Button, Row, Col, Toast } from 'react-bootstrap';
import ModalAbonoEstadoCuenta from './ModalAbonoEstadoCuenta';
import { BsPrinter } from 'react-icons/bs';

const API = 'http://localhost:5050';

const ListaAbonosClientes = () => {
  
  const { numeroEstado } = useParams();

  const [abonos, setAbonos] = useState([]);
  const [estado, setEstado] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [mostrarModalAbonoEstadoCuenta, setMostrarModalAbonoEstadoCuenta] = useState(false);

  const abrirModalAbonoEstadoCuenta = () => setMostrarModalAbonoEstadoCuenta(true);
  const cerrarModalAbonoEstadoCuenta = () => setMostrarModalAbonoEstadoCuenta(false);

  const formato = (n) =>
    (Number(n || 0)).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

  const fechaMX = (f) => {
    if (!f) return '—';
    const s = String(f);
    const d = new Date(s.length <= 10 ? `${s}T00:00:00` : s);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-MX');
  };

  // ========== Fetchers ==========
  // Datos del estado de cuenta (detalle con cliente, contenedor, total, etc.)
  const obtenerEstadoCuenta = async () => {
    const { data } = await axios.get(`${API}/estado-cuenta/abonos/detalle/${numeroEstado}`);
    setEstado(data || {});
  };

  // Lista de abonos
  const obtenerAbonos = async () => {
    const { data } = await axios.get(`${API}/estado-cuenta/abonos/${numeroEstado}`);

    const normTime = (f) => {
      if (!f) return 0;
      const s = String(f);
      // si viene solo 'YYYY-MM-DD', le agregamos hora para evitar TZ
      const d = new Date(s.length <= 10 ? `${s}T23:59:59` : s);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    };

    const lista = Array.isArray(data) ? data : [];
    lista.sort((a, b) =>
      (normTime(b.fecha_pago) - normTime(a.fecha_pago)) || ((b.id ?? 0) - (a.id ?? 0))
    );

    setAbonos(lista);
  };

  // ========== Acciones ==========
  const guardarAbono = async (nuevoAbono) => {
    try {
      await axios.post(`${API}/estado-cuenta/abonos`, nuevoAbono);
      await Promise.all([obtenerEstadoCuenta(), obtenerAbonos()]);
      setShowToast(true);
      cerrarModalAbonoEstadoCuenta();
    } catch (error) {
      console.error('Error al guardar abono:', error);
      alert('No se pudo guardar el abono.');
    }
  };

  const eliminarAbono = async (id) => {
    const confirmar = window.confirm('¿Eliminar este abono?');
    if (!confirmar) return;
    try {
      await axios.delete(`${API}/estado-cuenta/abonos/${id}`);
      await Promise.all([obtenerEstadoCuenta(), obtenerAbonos()]);
      setShowToast(true);
    } catch (error) {
      console.error('Error al eliminar abono:', error);
      alert('No se pudo eliminar el abono.');
    }
  };

  // ========== Efecto inicial ==========
  useEffect(() => {
    if (!numeroEstado) return;
    (async () => {
      try {
        await Promise.all([obtenerEstadoCuenta(), obtenerAbonos()]);
      } catch (e) {
        console.error('Error cargando estado de cuenta:', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeroEstado]);

  // ========== Cálculos ==========
  const totalAbonado = abonos.reduce(
    (sum, a) => sum + Number(a.pesos ?? a.abono ?? 0),
    0
  );
  const totalServicios = Number(estado.total || 0);
  const saldo = Math.max(totalServicios - totalAbonado, 0);

  const imprimirECC = () => {
    if (!numeroEstado) return;
    window.open(
      `${API}/estado-cuenta/pdf/sencillo/${encodeURIComponent(numeroEstado)}`,
      '_blank'
    );
  };

  return (
    <div className="container mt-4">
      {/* Encabezado */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <Table bordered size="sm" className="mb-3">
                  <thead className="table-light">
                    <tr>
                      <th>Número de Estado de Cuenta</th>
                      <th>Contenedor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{estado.id_estado_cuenta || numeroEstado}</td>
                      <td>{estado.contenedor || '—'}</td>
                    </tr>
                  </tbody>
                </Table>
                <Table bordered size="sm" className="mb-3">
                  <thead className="table-light">
                    <tr>
                      <th>Cliente</th>
                      <th>Mercancía</th>
                      <th>Tipo de Carga</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{estado.cliente || '—'}</td>
                      <td>{estado.mercancia || '—'}</td>
                      <td>{estado.tipo_carga || '—'}</td>
                    </tr>
                  </tbody>
                </Table>
                <Table bordered size="sm" className="mb-3 w-75">
                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Total de Servicios</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{fechaMX(estado.fecha_entrega)}</td>
                      <td>{formato(totalServicios)}</td>
                    </tr>
                  </tbody>
                </Table>
            </Col>

            <Col md={4}>
              <div className="bg-light p-4 rounded shadow-sm text-center">
                <h6 className="text-muted">Saldo</h6>
                <h2 className="text-primary">{formato(saldo)}</h2>
                <p className="mb-2">
                  <strong>Estatus:</strong>{' '}
                  <span className={saldo <= 0 ? 'text-success' : 'text-warning'}>
                    {saldo <= 0 ? 'Pagado' : 'Pendiente'}
                  </span>
                </p>
                <hr />
                <h6 className="text-muted mt-3">Total de Abonos</h6>
                <h5 className="fw-bold">{formato(totalAbonado)}</h5>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de abonos */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <strong>Lista de Abonos</strong>
          <div>
            <Button variant="secondary" size="sm" className="me-2" onClick={imprimirECC}
              disabled={!numeroEstado} title={!numeroEstado ? 'Sin folio' : 'Abrir PDF'}
            >
              <BsPrinter className="me-2" /> PDF del Estado
            </Button>
            <Button variant="success" size="sm" onClick={abrirModalAbonoEstadoCuenta}>
              + Agregar abono
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Monto</th>
                <th>Fecha de Pago</th>
                <th>Tipo de Transacción</th>
                <th style={{ width: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {abonos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No hay abonos registrados.
                  </td>
                </tr>
              ) : (
                abonos.map((a) => (
                  <tr key={a.id}>
                    <td>{formato(a.pesos ?? a.abono)}</td>
                    <td>{fechaMX(a.fecha_pago)}</td>
                    <td>{a.tipo_transaccion || '—'}</td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => eliminarAbono(a.id)}>
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Toast de éxito */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={2500}
        autohide
        bg="success"
        className="position-fixed bottom-0 end-0 m-4"
      >
        <Toast.Header closeButton={false}>
          <strong className="me-auto">Abonos</strong>
        </Toast.Header>
        <Toast.Body className="text-white">Cambios guardados correctamente.</Toast.Body>
      </Toast>

      {/* Modal para nuevo abono */}
      <ModalAbonoEstadoCuenta
        show={mostrarModalAbonoEstadoCuenta}
        handleClose={cerrarModalAbonoEstadoCuenta}
        idEstadoCuenta={numeroEstado}    
        saldoActual={saldo}
        onAbonoExitoso={guardarAbono}
      />
    </div>
  );
};

export default ListaAbonosClientes;
