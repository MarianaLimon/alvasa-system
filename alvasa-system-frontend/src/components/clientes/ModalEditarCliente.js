// src/components/clientes/ModalEditarCliente.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const ModalEditarCliente = ({ cliente, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        direccion: cliente.direccion,
        telefono: cliente.telefono,
        email: cliente.email,
      });
    }
  }, [cliente]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    try {
      await axios.put(`http://localhost:5050/clientes/${cliente.id}`, formData);
      if (onSave) onSave(); // Para refrescar la lista
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
    }
  };

  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} />
          </Form.Group>
          <Form.Group controlId="direccion">
            <Form.Label>Dirección</Form.Label>
            <Form.Control type="text" name="direccion" value={formData.direccion} onChange={handleChange} />
          </Form.Group>
          <Form.Group controlId="telefono">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
          </Form.Group>
          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleGuardar}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEditarCliente;
