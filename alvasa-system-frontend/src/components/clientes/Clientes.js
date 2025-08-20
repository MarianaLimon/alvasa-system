// Clientes.jsx
import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import FormularioCliente from './FormularioCliente';
import ListaClientes from './ListaClientes';
import './styles/styles-clientes.css';

const Clientes = () => {
  const [refrescar, setRefrescar] = useState(false);
  const toggleRefrescar = () => setRefrescar(!refrescar);

  return (
    <Container fluid>
      <Row className="mt-5">
        <h1 className="title-clientes">Lista de Clientes</h1>
      </Row>

      {/* 👇 AQUÍ: usa Row en lugar de div */}
      <Row className="container-clientes g-3">
        <Col md={4}>
          <FormularioCliente onClienteAgregado={toggleRefrescar} />
        </Col>
        <Col md={8}>
          <ListaClientes key={refrescar} />
        </Col>
      </Row>
    </Container>
  );
};

export default Clientes;
