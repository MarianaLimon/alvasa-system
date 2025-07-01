import React, { useEffect, useState } from 'react';
import { Table, Spinner, Card, Form, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { BsBoxSeam, BsCalendar, BsPerson } from 'react-icons/bs';

const ListaPagosProveedores = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [gruposAbiertos, setGruposAbiertos] = useState({});

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

  const toggleGrupo = (grupo) => {
    setGruposAbiertos((prev) => ({
      ...prev,
      [grupo]: !prev[grupo],
    }));
  };

  const pagosFiltrados = pagos.filter((p) =>
    p.cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.proveedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.numero_control?.toString().includes(busqueda)
  );

  const pagosAgrupados = pagosFiltrados.reduce((acc, pago) => {
    const [parte1, parte2] = pago.numero_control.split('-');
    const grupo = `${parte1}-${parte2}`;
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(pago);
    return acc;
  }, {});

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
          <div>
            {Object.entries(pagosAgrupados).map(([grupo, pagosGrupo]) => {
              const abierto = gruposAbiertos[grupo] || false;
              const { cliente, contenedor, fecha } = pagosGrupo[0];

              return (
                <Card key={grupo} className="m-3">
                  <Card.Header
                    onClick={() => toggleGrupo(grupo)}
                    style={{ cursor: 'pointer', background: '#f8f9fa' }}
                  >
                     <strong>{grupo}</strong>
                      <span className="mx-3">|</span>
                      <BsBoxSeam className="me-3" />
                      {contenedor}
                      <span className="mx-3">|</span>
                      <BsPerson className="me-3" />
                      {cliente}
                      <span className="mx-3">|</span>
                      <BsCalendar className="me-3" />
                      {fecha}
                    <span style={{ float: 'right' }}>{abierto ? '▼' : '▶'}</span>
                  </Card.Header>
                  <div className={`collapse-wrapper ${abierto ? 'expanded' : 'collapsed'}`}>
                    <Table striped bordered hover responsive className="mb-0">
                      <thead>
                        <tr>
                          <th># Control</th>
                          <th>Giro</th>
                          <th>Proveedor</th>
                          <th>Concepto</th>
                          <th>Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagosGrupo.map((pago, idx) => (
                          <tr key={idx}>
                            <td>{pago.numero_control}</td>
                            <td>{pago.giro}</td>
                            <td>{pago.proveedor}</td>
                            <td>{pago.concepto}</td>
                            <td>${parseFloat(pago.monto).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ListaPagosProveedores;
