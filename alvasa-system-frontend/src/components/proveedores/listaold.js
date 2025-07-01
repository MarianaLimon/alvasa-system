import React, { useEffect, useState } from 'react';
import { Table, Spinner, Card, Form, InputGroup } from 'react-bootstrap';
import axios from 'axios';

const ListaPagosProveedores = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [ordenCampo, setOrdenCampo] = useState('numero_control');
  const [ordenAscendente, setOrdenAscendente] = useState(true);

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const res = await axios.get('http://localhost:5050/pagos-proveedores');
        setPagos(res.data);
      } catch (error) {
        console.error('Error al cargar pagos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPagos();
  }, []);

  const ordenarPorCampo = (campo) => {
    if (campo === ordenCampo) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenCampo(campo);
      setOrdenAscendente(true);
    }
  };

  const pagosFiltrados = pagos
    .filter(p =>
      p.cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.proveedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.numero_control?.toString().includes(busqueda)
    )
    .sort((a, b) => {
      const valorA = a[ordenCampo] || '';
      const valorB = b[ordenCampo] || '';

      if (typeof valorA === 'number' && typeof valorB === 'number') {
        return ordenAscendente ? valorA - valorB : valorB - valorA;
      }

      return ordenAscendente
        ? valorA.toString().localeCompare(valorB.toString())
        : valorB.toString().localeCompare(valorA.toString());
    });

  const iconoOrden = (campo) => {
    if (campo !== ordenCampo) return '⇅';
    return ordenAscendente ? '↑' : '↓';
  };

  return (
    <Card className="mt-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <strong>Lista de Pagos a Proveedores</strong>
        <Form style={{ maxWidth: '300px' }}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Buscar por cliente o proveedor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </InputGroup>
        </Form>
      </Card.Header>

      <Card.Body className="p-0">
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th onClick={() => ordenarPorCampo('numero_control')} style={{ cursor: 'pointer' }}>
                    # Control {iconoOrden('numero_control')}
                  </th>
                  <th onClick={() => ordenarPorCampo('fecha')} style={{ cursor: 'pointer' }}>
                    Fecha {iconoOrden('fecha')}
                  </th>
                  <th onClick={() => ordenarPorCampo('cliente')} style={{ cursor: 'pointer' }}>
                    Cliente {iconoOrden('cliente')}
                  </th>
                  <th onClick={() => ordenarPorCampo('contenedor')} style={{ cursor: 'pointer' }}>
                    Contenedor {iconoOrden('contenedor')}
                  </th>
                  <th onClick={() => ordenarPorCampo('giro')} style={{ cursor: 'pointer' }}>
                    Giro {iconoOrden('giro')}
                  </th>
                  <th onClick={() => ordenarPorCampo('proveedor')} style={{ cursor: 'pointer' }}>
                    Proveedor {iconoOrden('proveedor')}
                  </th>
                  <th onClick={() => ordenarPorCampo('concepto')} style={{ cursor: 'pointer' }}>
                    Concepto {iconoOrden('concepto')}
                  </th>
                  <th onClick={() => ordenarPorCampo('monto')} style={{ cursor: 'pointer' }}>
                    Monto {iconoOrden('monto')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagosFiltrados.map((pago, index) => (
                  <tr key={index}>
                    <td>{pago.numero_control}</td>
                    <td>{pago.fecha}</td>
                    <td>{pago.cliente}</td>
                    <td>{pago.contenedor}</td>
                    <td>{pago.giro}</td>
                    <td>{pago.proveedor}</td>
                    <td>{pago.concepto}</td>
                    <td>${parseFloat(pago.monto).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ListaPagosProveedores;