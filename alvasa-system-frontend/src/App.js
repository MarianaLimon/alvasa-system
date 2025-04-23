import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';

import FormularioCliente from './components/clientes/FormularioCliente';
import ListaClientes from './components/clientes/ListaClientes';
import DetallesCliente from './components/clientes/DetallesCliente';

function App() {
  const [clientes, setClientes] = useState([]);
  const [clienteAEditar, setClienteAEditar] = useState(null);

  // Obtener los clientes de la base de datos
  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const respuesta = await axios.get('http://localhost:5000/clientes'); // Cambiar a tu API
        setClientes(respuesta.data);
      } catch (error) {
        console.error('Error al obtener los clientes', error);
      }
    };

    obtenerClientes();
  }, []); // Se ejecuta una vez cuando el componente se monta

  return (
    <div className="App">
      <Container>
        <Row>
          <Col md={6}>
            {/* Formulario para agregar o editar un cliente */}
            <h3>Formulario Cliente</h3>
            <FormularioCliente clienteAEditar={clienteAEditar} setClienteAEditar={setClienteAEditar} />
          </Col>
          <Col md={6}>
            {/* Lista de clientes con opciones de edición y eliminación */}
            <h3>Lista de Clientes</h3>
            <ListaClientes clientes={clientes} setClienteAEditar={setClienteAEditar} />
          </Col>
        </Row>
        <Row>
          <Col>
            {/* Detalles del cliente seleccionado */}
            {clienteAEditar && <DetallesCliente cliente={clienteAEditar} />}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;