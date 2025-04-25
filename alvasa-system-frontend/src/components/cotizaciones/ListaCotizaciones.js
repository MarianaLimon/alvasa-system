import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spinner, Button } from 'react-bootstrap';
import { BsEye, BsPencil, BsTrash, BsPrinter } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

const ListaCotizaciones = () => {
  console.log('Renderizando ListaCotizaciones');
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerCotizaciones = async () => {
      try {
        const response = await axios.get('http://localhost:5000/cotizaciones');
        setCotizaciones(response.data);
        console.log('Cotizaciones:', response.data); // <--- Aquí se agrega para inspección
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener cotizaciones:', error);
        setLoading(false);
      }
    };

    obtenerCotizaciones();
  }, []);

  const manejarVer = (id) => navigate(`/cotizaciones/${id}`);
  const manejarEditar = (id) => navigate(`/cotizaciones/editar/${id}`);
  const manejarImprimir = (id) => window.print();
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

  if (loading) return <div className="text-center my-4"><Spinner animation="border" /></div>;

  return (
    <div className="container mt-4">
      <h3>Lista de Cotizaciones</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Folio</th>
            <th>Cliente</th>
            <th>Empresa</th>
            <th>Fecha</th>
            <th>Mercancía</th>
            <th>Comisionista</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cotizaciones.map(cot => (
            <tr key={cot.id}>
              <td>{cot.folio}</td>
              <td>{cot.cliente}</td>
              <td>{cot.empresa}</td>
              <td>{cot.fecha}</td>
              <td>{cot.mercancia}</td>
              <td>{
                typeof cot.monto_comisionista === 'number'
                  ? `$${cot.monto_comisionista.toFixed(2)}`
                  : cot.monto_comisionista || '—'
              }</td>
              <td className="text-center">
                <Button variant="info" size="sm" className="me-2" onClick={() => manejarVer(cot.id)}>
                  <BsEye />
                </Button>
                <Button variant="warning" size="sm" className="me-2" onClick={() => manejarEditar(cot.id)}>
                  <BsPencil />
                </Button>
                <Button variant="primary" size="sm" className="me-2" onClick={() => manejarImprimir(cot.id)}>
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