import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spinner, Button, Form, Badge, InputGroup } from 'react-bootstrap';
import { BsEye, BsPencil, BsTrash, BsPrinter, BsSearch } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

const ListaCotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerCotizaciones = async () => {
      try {
        const response = await axios.get('http://localhost:5000/cotizaciones');
        setCotizaciones(response.data);
      } catch (error) {
        console.error('Error al obtener cotizaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    obtenerCotizaciones();
  }, []);

  const manejarVer = (id) => navigate(`/cotizaciones/${id}`);
  const manejarEditar = (id) => navigate(`/cotizaciones/editar/${id}`);
  const manejarImprimir = () => window.print();
  const manejarEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cotización?')) {
      try {
        await axios.delete(`http://localhost:5000/cotizaciones/${id}`);
        setCotizaciones(cotizaciones.filter(c => c.id !== id));
        alert('Cotización eliminada correctamente ✅');
      } catch (error) {
        console.error('Error al eliminar cotización:', error);
        alert('Hubo un error al eliminar la cotización ❌');
      }
    }
  };

  const cotizacionesFiltradas = cotizaciones.filter(cot =>
    cot.cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    cot.folio?.toLowerCase().includes(busqueda.toLowerCase()) ||
    cot.empresa?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderBadgeEstatus = (estatus) => {
    const clases = {
      'Autorizada': 'success',
      'En negociación': 'warning',
      'Entregado a cliente': 'info',
      'Declinada': 'danger'
    };
    return (
      <Badge bg={clases[estatus] || 'secondary'}>
        {estatus}
      </Badge>
    );
  };

  const formatoFechaBonita = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const dia = fecha.getDate();
    const mesNombres = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const mesNombre = mesNombres[fecha.getMonth()];
    const año = fecha.getFullYear();
    return `${dia} ${mesNombre} ${año}`;
  };

  if (loading) return <div className="text-center my-4"><Spinner animation="border" /></div>;

  return (
    <div className="container mt-4 container-listacot">
      <InputGroup className="mb-3 buscador-cotizaciones">
        <Form.Control
          type="text"
          placeholder="Buscar por cliente, folio o empresa..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <InputGroup.Text style={{ backgroundColor: '#3e3f42', color: 'white', border: '1px solid #555' }}>
          <BsSearch />
        </InputGroup.Text>
      </InputGroup>

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
    </div>
  );
};

export default ListaCotizaciones;