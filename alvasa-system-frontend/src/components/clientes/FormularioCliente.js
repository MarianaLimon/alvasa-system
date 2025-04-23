import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FormularioCliente = ({ clienteAEditar }) => {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  // Cargar datos del cliente a editar en el formulario
  useEffect(() => {
    if (clienteAEditar) {
      setNombre(clienteAEditar.nombre);
      setDireccion(clienteAEditar.direccion);
      setTelefono(clienteAEditar.telefono);
      setEmail(clienteAEditar.email);
    }
  }, [clienteAEditar]);

  // Manejar el envío del formulario (crear o actualizar cliente)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cliente = { nombre, direccion, telefono, email };

    try {
      if (clienteAEditar) {
        // Actualizar cliente
        await axios.put(`http://localhost:5000/clientes/${clienteAEditar.id}`, cliente);
        alert('Cliente actualizado');
      } else {
        // Crear nuevo cliente
        await axios.post('http://localhost:5000/clientes', cliente);
        alert('Cliente creado');
      }
    } catch (error) {
      console.error('Error al guardar el cliente', error);
      alert('Error al guardar el cliente');
    }
  };

  return (
    <div>
      <h3>{clienteAEditar ? 'Editar Cliente' : 'Agregar Cliente'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Dirección</label>
          <input
            type="text"
            className="form-control"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="text"
            className="form-control"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {clienteAEditar ? 'Actualizar Cliente' : 'Agregar Cliente'}
        </button>
      </form>
    </div>
  );
};

export default FormularioCliente;