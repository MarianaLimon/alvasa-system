import React, { useState } from 'react';
import { Row, Col, Card, Button, Table, Collapse } from 'react-bootstrap';
import { BsBoxSeam, BsPerson, BsCalendar, BsCashStack, BsPrinter } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/ListaEstadoCuentaClientes.css';
import ModalAbonoEstadoCuenta from './ModalAbonoEstadoCuenta';

const API = 'http://localhost:5050';

const CardEstadoCuentaCliente = ({ data, onCambioAbonos }) => {
  const [open, setOpen] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [estado, setEstado] = useState(data); // copia local
  const navigate = useNavigate();

  // Desestructura desde el estado local
  const {
    id_estado_cuenta: idEstadoCuenta,
    cliente,
    contenedor,
    fecha_entrega: fechaEntrega,
    tipo_carga: tipoCarga,
    mercancia,
    servicios = [],
    total = 0,
    abonado = 0,
    saldo = 0,
    estatus = 'Pendiente',
  } = estado;

  const formatoPesos = (valor) =>
    parseFloat(valor ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '—';
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = fecha.toLocaleString('es-MX', { month: 'long' });
    const anio = fecha.getFullYear();
    return `${dia} ${mes} ${anio}`;
  };

  // Trae datos actualizados del backend
  const actualizarDatos = async () => {
    const { data } = await axios.get(`${API}/estado-cuenta/abonos/detalle/${idEstadoCuenta}`);
    if (data) setEstado(data);
  };

  // POST: enviar abono y notificar al padre
  const guardarAbono = async (nuevoAbono) => {
    try {
      const { data: resp } = await axios.post(`${API}/estado-cuenta/abonos`, nuevoAbono);
      await actualizarDatos();        // refresca solo esta tarjeta
      setMostrarModal(false);

      // avisa al padre para actualizar la banda superior
      onCambioAbonos?.({
        idEstado: idEstadoCuenta,
        deltaAbono: Number(nuevoAbono.abono || 0),
        totalesFila: resp?.totales || null, // { abonado, saldo, estatus }
      });
    } catch (error) {
      console.error('❌ Error al guardar abono:', error);
      throw error;
    }
  };

  // Navegar al detalle de pagos
  const irAVerPagos = () => {
    const resumen = {
      numeroEstado: idEstadoCuenta,
      cliente,
      contenedor,
      fecha: formatearFecha(fechaEntrega),
      total,
      abonado,
      saldo,
    };
    navigate(`/estado-cuenta/abonos/${idEstadoCuenta}`, { state: { resumen } });
  };

  const imprimirPDF = () => {
    if (!idEstadoCuenta) return;
    window.open(`${API}/estado-cuenta/pdf/sencillo/${encodeURIComponent(idEstadoCuenta)}`, '_blank');
  };

  const colorEstatus =
    estatus === 'Pagado' ? 'success' : 'warning text-dark';

  return (
    <Card className="m-3">
      <Card.Header className='card-header-ecc' onClick={() => setOpen(!open)} >
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
            <span className="fw-bold" style={{ fontSize: '1.1rem', color: 'rgb(244, 100, 140)' }}>
              <BsCashStack className="me-1" />
              ${formatoPesos(total)}
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            Saldo:
            <span className="fw-bold" style={{ fontSize: '1.1rem', color: '#ffc107' }}>
              ${formatoPesos(saldo)}
            </span>
            <span className={`badge bg-${colorEstatus}`}>{estatus}</span>
            <span>{open ? '▼' : '▶'}</span>
          </div>
        </div>
      </Card.Header>

      <Collapse in={open}>
        <div className="p-5 bg-light">
          <Row className="mt-3">

            {/* Columna 1 */}
            <Col md={3}>
              <Card className="p-3 text-center shadow-sm">
                <p><strong>Total del Contenedor:</strong><br /> ${formatoPesos(total)}</p>
                <p><strong>Total Abonado:</strong><br /> ${formatoPesos(abonado)}</p>
                <p><strong>Saldo Pendiente:</strong><br /> ${formatoPesos(saldo)}</p>
              </Card>
            </Col>
        
            {/* Columna 2 */}
            <Col md={2}>
              <div style={{ marginBottom: '2rem' }}>
                <p className="mb-0"><strong>Tipo de carga:</strong> {tipoCarga}</p>
                <p className="mb-0"><strong>Mercancía:</strong> {mercancia}</p>
              </div>
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

                <Button className="btn-verpagos" size="sm" onClick={irAVerPagos}>
                  Ver Pagos
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={imprimirPDF}>
                  <BsPrinter className="me-1" /> Imprimir
                </Button>
              </div>
            </Col>
            
            {/* Columna 3 */}
            <Col md={7}>
              <div className="tabla-servicios-card">
                <div className="tabla-servicios-wrapper">
                  <Table bordered size="sm" className="bg-white mb-0">
                    <thead>
                      <tr className="listaec-titles">
                        <th>Giro</th>
                        <th>Servicio</th>
                        <th>Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(servicios || []).map((item, i) => (
                        <tr key={i}>
                          <td className="fila-ec">{item.giro}</td>
                          <td className="fila-ec">{item.servicio}</td>
                          <td className="fila-ec">${formatoPesos(item.importe)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Indicador sutil de “hay más” */}
                  <div className="tabla-servicios-fade" />
                </div>

                {/* Total siempre visible */}
                <div className="tabla-servicios-total">
                  <span className="fw-bold">Total</span>
                  <span className="fw-bold">${formatoPesos(total)}</span>
                </div>
              </div>
            </Col>

          </Row>
        </div>
      </Collapse>
    </Card>
  );
};

export default CardEstadoCuentaCliente;
