import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spinner, Button, Form, Badge, InputGroup, Toast, ToastContainer } from 'react-bootstrap';
import { BsEye, BsPencil, BsTrash, BsPrinter, BsSearch } from 'react-icons/bs';
import './styles/style-cotizaciones.css';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5050';

const ListaCotizaciones = () => {
  const [cotizaciones, setCotizaciones]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [busqueda, setBusqueda]           = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [desde, setDesde]                 = useState('');   // YYYY-MM-DD
  const [hasta, setHasta]                 = useState('');   // YYYY-MM-DD

  const [showToast, setShowToast]         = useState(false);
  const [toastMsg, setToastMsg]           = useState('');
  const [toastVariant, setToastVariant]   = useState('success');
  const navigate = useNavigate();

  // Cargar con filtros desde el backend
  const cargarCotizaciones = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/cotizaciones`, {
        params: {
          q: busqueda || undefined,
          status: statusFilter || undefined,
          desde: desde || undefined,
          hasta: hasta || undefined
        }
      });
      setCotizaciones(data);
    } catch (error) {
      console.error('Error al obtener cotizaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    cargarCotizaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Volver a cargar cuando cambian filtros
  useEffect(() => {
    // Opcional: pequeño debounce
    const t = setTimeout(() => {
      cargarCotizaciones();
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, statusFilter, desde, hasta]);

  const manejarVer     = id => navigate(`/cotizaciones/${id}`);
  const manejarEditar  = id => navigate(`/cotizaciones/editar/${id}`);
  const manejarImprimir = id =>
    window.open(`${API}/api/cotizaciones/${id}/pdf`, '_blank');

  const manejarEliminar = async id => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta cotización?')) return;
    try {
      await axios.delete(`${API}/cotizaciones/${id}`);
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

  const limpiarFiltros = () => {
    setBusqueda('');
    setStatusFilter('');
    setDesde('');
    setHasta('');
    cargarCotizaciones(); // vuelve a traer todas
  };

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
    <div className="container mt-4">
      <h1 className='title-listacot'>Lista de Cotizaciones</h1>

      {/* Filtros y buscador */}
      <div className="d-flex mb-3 align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center flex-wrap gap-2">
          <Form.Select
            className="me-2"
            style={{ width: '190px' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estatus</option>
            <option value="Autorizada">Autorizada</option>
            <option value="En negociación">En negociación</option>
            <option value="Entregado a cliente">Entregado a cliente</option>
            <option value="Declinada">Declinada</option>
          </Form.Select>

          {/* Fecha desde */}
          <Form.Control
            type="date"
            className="me-2"
            style={{ width: 180 }}
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            placeholder="Desde"
          />

          {/* Fecha hasta */}
          <Form.Control
            type="date"
            className="me-2"
            style={{ width: 180 }}
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            placeholder="Hasta"
          />

          {/* Buscador */}
          <InputGroup className="w-auto buscador-cotizaciones">
            <Form.Control
              type="text"
              placeholder="Buscar por cliente, folio, empresa o mercancía…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <InputGroup.Text style={{ backgroundColor: '#17A2B8', color: 'white', border: '1px solid #17A2B8' }}>
              <BsSearch />
            </InputGroup.Text>
          </InputGroup>
        </div>


        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={limpiarFiltros}>
            Limpiar filtros
          </Button>
          <Button id="btnNuevaCotizacion" variant="success" onClick={() => navigate('/nuevacotizacion')}>
            + Nueva Cotización
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <Table className="tabla-cotizaciones">
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
          {cotizaciones.map(cot => (
            <tr key={cot.id}>
              <td>{cot.folio}</td>
              <td>{cot.cliente}</td>
              <td>{cot.empresa}</td>
              <td>{formatoFechaBonita(cot.fecha)}</td>
              <td>{cot.mercancia}</td>
              <td>{
                typeof cot.monto_comisionista === 'number'
                  ? `$${cot.monto_comisionista.toFixed(2)}`
                  : cot.monto_comisionista || '—'
              }</td>
              <td>{renderBadgeEstatus(cot.estatus)}</td>
              <td className="text-center">
                <Button variant="info" size="sm" className="me-2" onClick={() => manejarVer(cot.id)}>
                  <BsEye />
                </Button>
                <Button variant="warning" size="sm" className="me-2 btn-editar-cotizacion" onClick={() => manejarEditar(cot.id)}>
                  <BsPencil />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="me-2"
                  onClick={() => manejarImprimir(cot.id)}
                >
                  <BsPrinter />
                </Button>
                <Button className="btn-eliminar-cotizacion" variant="danger" size="sm" onClick={() => manejarEliminar(cot.id)}>
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
