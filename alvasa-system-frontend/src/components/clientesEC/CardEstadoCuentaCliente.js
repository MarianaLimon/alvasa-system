import React, { useState } from 'react';
import { Row, Col, Card, Button, Table, Collapse } from 'react-bootstrap';
import {
  BsBoxSeam,
  BsPerson,
  BsCalendar,
  BsCashStack,
  BsPrinter
} from 'react-icons/bs';
import './ListaEstadoCuentaClientes.css';

const CardEstadoCuentaCliente = ({ data }) => {
  const [open, setOpen] = useState(false);

  // Adaptar nombres del backend a los que se usaban en el diseño
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
  } = data;

  const colorEstatus = estatus === 'Pagado' ? 'success' : estatus === 'Parcial' ? 'warning text-dark' : 'warning text-dark';

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
            {fechaEntrega}
            <span className="mx-3">|</span>
            <span className="fw-bold" style={{ fontSize: '1.2rem', color: 'rgb(26, 224, 255)' }}>
              <BsCashStack className="me-1" />
              ${total.toLocaleString()}
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            Saldo:
            <span className="fw-bold" style={{ fontSize: '1.2rem', color: '#ffc107' }}>
              ${saldo.toLocaleString()}
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
                      <td className="fila-ec">${parseFloat(item.importe).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="fw-bold">
                    <td colSpan={2} className="fila-ec">Total</td>
                    <td className="fila-ec">${total.toLocaleString()}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>

            {/* Columna 2: Totales */}
            <Col md={3}>
              <Card className="p-3 text-center shadow-sm">
                <p><strong>Total del Contenedor:</strong><br /> ${total.toLocaleString()}</p>
                <p><strong>Total Abonado:</strong><br /> ${abonado.toLocaleString()}</p>
                <p><strong>Saldo Pendiente:</strong><br /> ${saldo.toLocaleString()}</p>
              </Card>
            </Col>

            {/* Columna 3: Botones uno debajo del otro */}
            <Col md={3}>
              <div className="d-flex flex-column gap-2 mt-3 mt-5">
                <Button variant="success" size="sm">Pagar</Button>
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
