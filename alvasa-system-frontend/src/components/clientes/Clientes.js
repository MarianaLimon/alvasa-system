import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import FormularioCliente from './FormularioCliente';
import ListaClientes from './ListaClientes';

const Clientes = () => {
  const [refrescar, setRefrescar] = useState(false);
  

  const toggleRefrescar = () => setRefrescar(!refrescar);

  return (
    <Container fluid>
      <Row className="mt-5">
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