import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import FormularioCliente from './FormularioCliente';
import ListaClientes from './ListaClientes';

const Clientes = () => {
  const [refrescar, setRefrescar] = useState(false);
  const navigate = useNavigate();

  const toggleRefrescar = () => setRefrescar(!refrescar);

  return (
    <Container fluid>
      <Row className="mt-1">
        <Col md={4}>
          <FormularioCliente onClienteAgregado={toggleRefrescar} />

          {/* Botón debajo del formulario */}
          <div className="d-grid mt-3">
          <Button variant="success" onClick={() => navigate('/cotizaciones/nueva')}>
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Cotización
          </Button>
          </div>
        </Col>
        <Col md={8}>
          <ListaClientes key={refrescar} />
        </Col>
      </Row>
    </Container>
  );
};

export default Clientes;