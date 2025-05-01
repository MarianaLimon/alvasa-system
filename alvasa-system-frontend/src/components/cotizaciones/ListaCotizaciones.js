import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {Table, Spinner, Button, Form, Badge, InputGroup, Toast, ToastContainer} from 'react-bootstrap';
import { BsEye, BsPencil, BsTrash, BsPrinter, BsSearch } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

const ListaCotizaciones = () => {
  const [cotizaciones, setCotizaciones]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [busqueda, setBusqueda]           = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [showToast, setShowToast]         = useState(false);
  const [toastMsg, setToastMsg]           = useState('');
  const [toastVariant, setToastVariant]   = useState('success');
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerCotizaciones = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/cotizaciones');
        setCotizaciones(data);
      } catch (error) {
        console.error('Error al obtener cotizaciones:', error);
      } finally {
        setLoading(false);
      }
    };
    obtenerCotizaciones();
  }, []);

  const manejarVer     = id => navigate(`/cotizaciones/${id}`);
  const manejarEditar  = id => navigate(`/cotizaciones/editar/${id}`);
  const manejarImprimir= () => window.print();

  const manejarEliminar = async id => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta cotización?')) return;
    try {
      await axios.delete(`http://localhost:5000/cotizaciones/${id}`);
      setCotizaciones(prev => prev.filter(c => c.id !== id));
      setToastVariant('success');
      setToastMsg('Cotización eliminada correctamente');
      setShowToast(true);
    } catch (error) {
      console.error(error);
      setToastVariant('danger');
      setToastMsg('Error al eliminar la cotización');
      setShowToast(true);
    }
  };

  const cotizacionesFiltradas = cotizaciones.filter(cot => {
    const matchesStatus = statusFilter ? cot.estatus === statusFilter : true;
    const matchesSearch  =
      cot.cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cot.folio?.toLowerCase().includes(busqueda.toLowerCase())   ||
      cot.empresa?.toLowerCase().includes(busqueda.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const renderBadgeEstatus = estatus => {
    const clases = {
      'Autorizada': 'success',
      'En negociación': 'warning',
      'Entregado a cliente': 'info',
      'Declinada': 'danger'
    };
    return <Badge bg={clases[estatus] || 'secondary'}>{estatus}</Badge>;
  };

  const formatoFechaBonita = fechaStr => {
    const fecha = new Date(fechaStr);
    const dia = fecha.getDate();
    const mesNombres = [
      'enero','febrero','marzo','abril','mayo','junio',
      'julio','agosto','septiembre','octubre','noviembre','diciembre'
    ];
    return `${dia} ${mesNombres[fecha.getMonth()]} ${fecha.getFullYear()}`;
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container mt-4 container-listacot">
      {/* Filtro y buscador */}
      <div className="d-flex mb-3 align-items-center">
        <Form.Select
          className="me-3"
          style={{ width: '180px' }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Todos los estatus</option>
          <option value="Autorizada">Autorizada</option>
          <option value="En negociación">En negociación</option>
          <option value="Entregado a cliente">Entregado a cliente</option>
          <option value="Declinada">Declinada</option>
        </Form.Select>

        <InputGroup className="w-auto buscador-cotizaciones">
          <Form.Control
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <InputGroup.Text style={{ backgroundColor: '#3e3f42', color: 'white', border: '1px solid #555' }}>
            <BsSearch />
          </InputGroup.Text>
        </InputGroup>
      </div>

      {/* Tabla */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Folio</th>
            <th>Cliente</th>
            <th>Empresa</th>
            <th>Fecha</th>
            <th>Mercancía</th>
            <th>Comisión</th>
            <th>Estatus</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cotizacionesFiltradas.map(cot => (
            <tr key={cot.id}>
              <td>{cot.folio}</td>
              <td>{cot.cliente}</td>
              <td>{cot.empresa}</td>
              <td>{formatoFechaBonita(cot.fecha)}</td>
              <td>{cot.mercancia}</td>
              <td>{typeof cot.monto_comisionista === 'number'
                    ? `$${cot.monto_comisionista.toFixed(2)}`
                    : cot.monto_comisionista || '—'
              }</td>
              <td>{renderBadgeEstatus(cot.estatus)}</td>
              <td className="text-center">
                <Button variant="info" size="sm" className="me-2" onClick={() => manejarVer(cot.id)}>
                  <BsEye />
                </Button>
                <Button variant="warning" size="sm" className="me-2" onClick={() => manejarEditar(cot.id)}>
                  <BsPencil />
                </Button>
                <Button variant="primary" size="sm" className="me-2" onClick={manejarImprimir}>
                  <BsPrinter />
                </Button>
                <Button variant="danger" size="sm" onClick={() => manejarEliminar(cot.id)}>
                  <BsTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Toast de notificaciones */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toastVariant}
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">
            {toastMsg}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default ListaCotizaciones;