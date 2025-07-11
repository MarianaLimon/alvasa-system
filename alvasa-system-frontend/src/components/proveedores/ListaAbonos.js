import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, Table, Button, Row, Col, Toast } from 'react-bootstrap';
import ModalPago from './ModalPago';
import { BsPrinter } from 'react-icons/bs';

const ListaAbonos = () => {
  const { numero_control } = useParams();
  const [abonos, setAbonos] = useState([]);
  const [pago, setPago] = useState({});
  const [showToast, setShowToast] = useState(false);

  const [mostrarModalPago, setMostrarModalPago] = useState(false);

  const handleAbrirModalPago = () => {
    setMostrarModalPago(true);
  };

  const handleCerrarModalPago = () => {
    setMostrarModalPago(false);
  };

  const handleGuardarPago = async (nuevoPago) => {
    try {
      await axios.post('http://localhost:5050/pagos-proveedores/abonos', nuevoPago);
      await fetchAbonos();
      await fetchDatosPago();
      setShowToast(true);
      setMostrarModalPago(false);
    } catch (error) {
      console.error('Error al guardar el abono:', error);
    }
  };


  const fetchDatosPago = async () => {
    try {
      const res = await axios.get('http://localhost:5050/pagos-proveedores');
      const fila = res.data.find(p => p.numero_control === numero_control);
      if (fila) setPago(fila);
    } catch (error) {
      console.error('Error al obtener datos de pago:', error);
    }
  };

  const fetchAbonos = async () => {
    try {
      const res = await axios.get(`http://localhost:5050/pagos-proveedores/abonos/${numero_control}`);
      setAbonos(res.data);
    } catch (error) {
      console.error('Error al obtener abonos:', error);
    }
  };

  const eliminarAbono = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este abono?');
    if (!confirmar) return;

    try {
      await axios.delete(`http://localhost:5050/pagos-proveedores/abonos/${id}`);
      await fetchAbonos();
      await fetchDatosPago();
      setShowToast(true);
    } catch (error) {
      console.error('Error al eliminar abono:', error);
    }
  };

  const handleGenerarPDF = async () => {
    try {
      const pagoConFormato = {
        numero_control: pago.numero_control,
        cliente: pago.cliente,
        contenedor: pago.contenedor,
        giro: pago.giro,
        proveedor: pago.proveedor,
        concepto: pago.concepto,
        tipo_moneda: pago.tipo_moneda?.toUpperCase() || 'MX',
        tipo_cambio: parseFloat(pago.tipo_cambio) || null,
        monto_original: parseFloat(pago.monto) || 0,
        monto: parseFloat(pago.pesos) || parseFloat(pago.monto),
        estatus: pago.estatus
      };

      const res = await axios.post(
        'http://localhost:5050/pagos-proveedores/abonos/pdf',
        {
          numero_control,
          pago: pagoConFormato,
          abonos
        },
        { responseType: 'blob' }
      );

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    } catch (error) {
      console.error('Error al generar PDF:', error);
    }
  };



  useEffect(() => {
    const fetchTodo = async () => {
      try {
        await fetchDatosPago();
        await fetchAbonos();
      } catch (error) {
        console.error('Error al cargar datos del pago:', error);
      }
    };

    fetchTodo();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numero_control]);

  const totalAbonado = abonos.reduce((sum, abono) => sum + parseFloat(abono.abono), 0);

  const formatMoneda = () => {
    const tipo = pago?.tipo_moneda?.toUpperCase() || '';
    const monto = parseFloat(pago.monto).toFixed(2);
    if (tipo && tipo !== 'MX') {
      return `${tipo} $${monto}`;
    } else {
      return `MX $${monto}`;
    }
  };

  const formatPesos = () => {
    if (pago?.tipo_moneda?.toUpperCase() !== 'MX') {
      return `$${parseFloat(pago.pesos).toFixed(2)}`;
    }
    return null;
  };

  const saldo = Math.max(parseFloat(pago.saldo) || 0, 0);

  return (
    <div className="container mt-4">
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <p><strong>Número de control:</strong> {numero_control}</p>
              <p><strong>Contenedor:</strong> {pago.contenedor}</p>
              <p><strong>Giro:</strong> {pago.giro}</p>
              <p><strong>Proveedor:</strong> {pago.proveedor}</p>
              <p><strong>Concepto de pago:</strong> {pago.concepto}</p>
              <p><strong>Monto original:</strong> {formatMoneda()}</p>
              {formatPesos() && (
                <p><strong>Equivalente en pesos:</strong> {formatPesos()}</p>
              )}
              <p><strong>Total de abonos:</strong> ${totalAbonado.toFixed(2)}</p>
            </Col>
            <Col md={4} className="text-end">
              <h3><strong>Saldo:</strong></h3>
              <h1 className="text-primary">${saldo.toFixed(2)}</h1>
              <p><strong>Estatus:</strong> {pago.estatus}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <strong>Lista de Abonos</strong>
          </div>
          <div>
            <Button variant="secondary" size="sm" onClick={handleGenerarPDF} className="me-2">
              <BsPrinter className="me-2" /> Imprimir PDF
            </Button>
            <Button variant="success" size="sm" onClick={handleAbrirModalPago}>
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {abonos.length === 0 ? (
                <tr><td colSpan="4">No hay abonos registrados.</td></tr>
              ) : (
                abonos.map((abono) => (
                  <tr key={abono.id}>
                    <td>${parseFloat(abono.abono).toFixed(2)}</td>
                    <td>{new Date(abono.fecha_pago).toLocaleDateString('es-MX')}</td>
                    <td>{abono.tipo_transaccion}</td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => eliminarAbono(abono.id)}>
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
          <strong className="me-auto">Abono eliminado</strong>
        </Toast.Header>
        <Toast.Body className="text-white">El abono ha sido eliminado correctamente.</Toast.Body>
      </Toast>

      <ModalPago
        mostrar={mostrarModalPago}
        onCerrar={handleCerrarModalPago}
        numeroControl={numero_control}
        saldo={saldo}
        onGuardar={handleGuardarPago}
      />
    </div>
  );
};

export default ListaAbonos;
