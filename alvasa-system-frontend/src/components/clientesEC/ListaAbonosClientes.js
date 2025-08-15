import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, Table, Button, Row, Col, Toast } from 'react-bootstrap';
import ModalAbonoEstadoCuenta from './ModalAbonoEstadoCuenta';
import { BsPrinter } from 'react-icons/bs';

const ListaAbonosClientes = () => {
  const { id_estado_cuenta } = useParams();
  const [abonos, setAbonos] = useState([]);
  const [estado, setEstado] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [mostrarModalAbonoEstadoCuenta, setMostrarModalAbonoEstadoCuenta] = useState(false);

  const abrirModalAbonoEstadoCuenta = () => setMostrarModalAbonoEstadoCuenta(true);
  const cerrarModalAbonoEstadoCuenta = () => setMostrarModalAbonoEstadoCuenta(false);

  const obtenerAbonos = async () => {
    try {
      const res = await axios.get(`http://localhost:5050/abonos-estado-cuenta/${id_estado_cuenta}`);
      setAbonos(res.data);
    } catch (error) {
      console.error('Error al obtener abonos:', error);
    }
  };

  const obtenerEstadoCuenta = async () => {
    try {
      const res = await axios.get(`http://localhost:5050/estado-cuenta-clientes/${id_estado_cuenta}`);
      setEstado(res.data);
    } catch (error) {
      console.error('Error al obtener estado de cuenta:', error);
    }
  };

  const guardarAbono = async (nuevoAbono) => {
    try {
      await axios.post('http://localhost:5050/abonos-estado-cuenta', nuevoAbono);
      await obtenerAbonos();
      await obtenerEstadoCuenta();
      setShowToast(true);
      cerrarModalAbonoEstadoCuenta();
    } catch (error) {
      console.error('Error al guardar abono:', error);
    }
  };

  const eliminarAbono = async (id) => {
    const confirmar = window.confirm('¿Eliminar este abono?');
    if (!confirmar) return;
    try {
      await axios.delete(`http://localhost:5050/abonos-estado-cuenta/${id}`);
      await obtenerAbonos();
      await obtenerEstadoCuenta();
      setShowToast(true);
    } catch (error) {
      console.error('Error al eliminar abono:', error);
    }
  };

  useEffect(() => {
    obtenerEstadoCuenta();
    obtenerAbonos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_estado_cuenta]);

  const totalAbonado = abonos.reduce((sum, a) => sum + parseFloat(a.abono), 0);
  const saldo = Math.max(parseFloat(estado.saldo || 0), 0);
  const total = parseFloat(estado.total || 0);
  const formato = (n) => `$${parseFloat(n || 0).toFixed(2)}`;

  return (
    <div className="container mt-4">
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <Table bordered size="sm" className="mb-3">
                <tbody>
                  <tr>
                    <th>Número de Estado de Cuenta</th>
                    <td>{estado.id_estado_cuenta}</td>
                    <th>Contenedor</th>
                    <td>{estado.contenedor}</td>
                  </tr>
                  <tr>
                    <th>Cliente</th>
                    <td>{estado.cliente}</td>
                    <th>Fecha</th>
                    <td>{new Date(estado.fecha_entrega).toLocaleDateString('es-MX')}</td>
                  </tr>
                  <tr>
                    <th>Tipo de Carga</th>
                    <td>{estado.tipo_carga}</td>
                    <th>Mercancía</th>
                    <td>{estado.mercancia}</td>
                  </tr>
                  <tr>
                    <th colSpan={3}>Total de Servicios</th>
                    <td>{formato(total)}</td>
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
                  <span className={estado.estatus === 'Pagado' ? 'text-success' : 'text-warning'}>
                    {estado.estatus}
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

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <strong>Lista de Abonos</strong>
          <div>
            <Button variant="secondary" size="sm" className="me-2">
              <BsPrinter className="me-2" /> Imprimir PDF
            </Button>
            <Button variant="success" size="sm" onClick={abrirModalAbonoEstadoCuenta}>+ Agregar abono</Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Monto</th>
                <th>Fecha de Pago</th>
                <th>Tipo de Transacción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {abonos.length === 0 ? (
                <tr><td colSpan="4">No hay abonos registrados.</td></tr>
              ) : (
                abonos.map((a) => (
                  <tr key={a.id}>
                    <td>{formato(a.abono)}</td>
                    <td>{new Date(a.fecha_pago).toLocaleDateString('es-MX')}</td>
                    <td>{a.tipo_transaccion}</td>
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

      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={3000}
        autohide
        bg="success"
        className="position-fixed bottom-0 end-0 m-4"
      >
        <Toast.Header closeButton={false}>
          <strong className="me-auto">Abono actualizado</strong>
        </Toast.Header>
        <Toast.Body className="text-white">El abono se procesó correctamente.</Toast.Body>
      </Toast>

      <ModalAbonoEstadoCuenta
        show={mostrarModalAbonoEstadoCuenta}
        handleClose={cerrarModalAbonoEstadoCuenta}
        idEstadoCuenta={id_estado_cuenta}
        saldoActual={saldo}
        onAbonoExitoso={guardarAbono}
      />

    </div>
  );
};

export default ListaAbonosClientes;
