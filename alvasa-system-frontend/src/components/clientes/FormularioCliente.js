import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Card } from 'react-bootstrap';

const FormularioCliente = ({ onClienteAgregado }) => {
  const [cliente, setCliente] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
  });

  const handleChange = (e) => {
    setCliente({
      ...cliente,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5050/clientes', cliente);
      setCliente({ nombre: '', direccion: '', telefono: '', email: '' });
      if (onClienteAgregado) onClienteAgregado(); // Llamada para refrescar la tabla
    } catch (error) {
      console.error('Error al agregar cliente:', error);
    }
  };

  return (
    <Card className="card-formulario">
      <Card.Body>
        <Card.Title className="title-formulario-addcliente">Agregar Cliente</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control type="text" name="nombre" value={cliente.nombre} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Dirección</Form.Label>
            <Form.Control type="text" name="direccion" value={cliente.direccion} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control type="text" name="telefono" value={cliente.telefono} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={cliente.email} onChange={handleChange} />
          </Form.Group>
          <div className="d-flex justify-content-center mt-3">
            <Button type="submit" variant="success">
                Agregar
            </Button>
            </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FormularioCliente;
