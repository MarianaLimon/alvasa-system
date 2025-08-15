import React, { useState } from 'react';
import { Row, Col, Card, Button, Table, Collapse } from 'react-bootstrap';
import {
  BsBoxSeam,
  BsPerson,
  BsCalendar,
  BsCashStack,
  BsPrinter
} from 'react-icons/bs';
import axios from 'axios';
import './ListaEstadoCuentaClientes.css';
import ModalAbonoEstadoCuenta from './ModalAbonoEstadoCuenta';

const CardEstadoCuentaCliente = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  // ✅ copia local que SÍ re-renderiza
  const [estado, setEstado] = useState(data);

  // 🔢 Formato de dinero
  const formatoPesos = (valor) =>
    parseFloat(valor).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  // 📆 Fecha legible
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '—';
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = fecha.toLocaleString('es-MX', { month: 'long' });
    const anio = fecha.getFullYear();
    return `${dia} ${mes} ${anio}`;
  };

  // 🔁 Traer datos actualizados tras un abono
  const actualizarDatos = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5050/estado-cuenta/abonos/detalle/${estado.id_estado_cuenta}`
      );
      if (res.data) setEstado(res.data); // ✅ ahora sí re-renderiza
    } catch (error) {
      console.error('❌ Error al actualizar estado de cuenta:', error);
    }
  };

  // 💰 POST: enviar abono al backend
  const guardarAbono = async (nuevoAbono) => {
    try {
      const res = await axios.post(
        'http://localhost:5050/estado-cuenta/abonos',
        nuevoAbono
      );
      console.log('✅ Abono registrado:', res.data);

      await actualizarDatos();  // 🔄 refresca datos en la tarjeta
      setMostrarModal(false);   // ✅ cierra modal

    } catch (error) {
      console.error('❌ Error al guardar abono:', error);
      throw error;
    }
  };

  // 👇 ahora leemos TODO desde "estado", no desde "data"
  const {
    id_estado_cuenta: idEstadoCuenta,
    cliente,
    contenedor,
    fecha_entrega: fechaEntrega,
    tipo_carga: tipoCarga,
    mercancia,
    servicios = [],
    total,
    abonado,
    saldo,
    estatus
  } = estado;

  const colorEstatus =
    estatus === 'Pagado'
      ? 'success'
      : estatus === 'Parcial'
      ? 'warning text-dark'
      : 'warning text-dark';

  return (
    <Card className="m-3">
      <Card.Header
        onClick={() => setOpen(!open)}
        style={{ cursor: 'pointer', background: '#5751AB', color: '#fff' }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <strong>{idEstadoCuenta}</strong>
            <span className="mx-3">|</span>
            <BsBoxSeam className="me-2" />
            {contenedor}
            <span className="mx-3">|</span>
            <BsPerson className="me-2" />
            {cliente}
            <span className="mx-3">|</span>
            <BsCalendar className="me-2" />
            {formatearFecha(fechaEntrega)}
            <span className="mx-3">|</span>
            <span
              className="fw-bold"
              style={{ fontSize: '1.2rem', color: 'rgb(26, 224, 255)' }}
            >
              <BsCashStack className="me-1" />
              ${formatoPesos(total)}
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            Saldo:
            <span className="fw-bold" style={{ fontSize: '1.2rem', color: '#ffc107' }}>
              ${formatoPesos(saldo)}
            </span>
            <span className={`badge bg-${colorEstatus}`}>{estatus}</span>
            <span>{open ? '▼' : '▶'}</span>
          </div>
        </div>
      </Card.Header>

      <Collapse in={open}>
        <div className="p-3 bg-light">
          <Row className="mt-3">
            {/* Columna 1: Tabla */}
            <Col md={6}>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                <p className="mb-0"><strong>Tipo de carga:</strong> {tipoCarga}</p>
                <p className="mb-0"><strong>Mercancía:</strong> {mercancia}</p>
              </div>
              <Table bordered responsive size="sm" className="bg-white">
                <thead>
                  <tr className="listaec-titles">
                    <th>Giro</th>
                    <th>Servicio</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {servicios.map((item, i) => (
                    <tr key={i}>
                      <td className="fila-ec">{item.giro}</td>
                      <td className="fila-ec">{item.servicio}</td>
                      <td className="fila-ec">${formatoPesos(item.importe)}</td>
                    </tr>
                  ))}
                  <tr className="fw-bold">
                    <td colSpan={2} className="fila-ec">Total</td>
                    <td className="fila-ec">${formatoPesos(total)}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>

            {/* Columna 2: Totales */}
            <Col md={3}>
              <Card className="p-3 text-center shadow-sm">
                <p><strong>Total del Contenedor:</strong><br /> ${formatoPesos(total)}</p>
                <p><strong>Total Abonado:</strong><br /> ${formatoPesos(abonado)}</p>
                <p><strong>Saldo Pendiente:</strong><br /> ${formatoPesos(saldo)}</p>
              </Card>
            </Col>

            {/* Columna 3: Botones */}
            <Col md={3}>
              <div className="d-flex flex-column gap-2 mt-3 mt-5">
                <Button variant="success" size="sm" onClick={() => setMostrarModal(true)}>
                  Pagar
                </Button>

                <ModalAbonoEstadoCuenta
                  show={mostrarModal}
                  handleClose={() => setMostrarModal(false)}
                  idEstadoCuenta={idEstadoCuenta}
                  saldoActual={saldo}
                  onAbonoExitoso={guardarAbono}
                />

                <Button className="btn-verpagos" size="sm">Ver Pagos</Button>
                <Button variant="outline-secondary" size="sm">
                  <BsPrinter className="me-1" /> Imprimir
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </Collapse>
    </Card>
  );
};

export default CardEstadoCuentaCliente;
