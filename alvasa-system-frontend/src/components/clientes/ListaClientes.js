import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';

const ListaClientes = ({ setClienteAEditar }) => {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    // Definir la función obtenerClientes dentro de useEffect
    const obtenerClientes = async () => {
      try {
        const respuesta = await axios.get('http://localhost:5000/clientes'); // Asegúrate de que la URL sea correcta
        setClientes(respuesta.data);
      } catch (error) {
        console.error('Error al obtener los clientes', error);
      }
    };

    obtenerClientes(); // Llamar a la función dentro del useEffect
  }, []); // Se ejecuta una vez al montar el componente

  const eliminarCliente = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/clientes/${id}`);
      setClientes(clientes.filter(cliente => cliente.id !== id)); // Actualiza la lista
      alert('Cliente eliminado');
    } catch (error) {
      console.error('Error al eliminar el cliente', error);
      alert('Error al eliminar el cliente');
    }
  };

  const editarCliente = (cliente) => {
    setClienteAEditar(cliente);
  };

  return (
    <div>
      <h3>Lista de Clientes</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.id}</td>
              <td>{cliente.nombre}</td>
              <td>{cliente.direccion}</td>
              <td>{cliente.telefono}</td>
              <td>{cliente.email}</td>
              <td>
                <Button variant="warning" onClick={() => editarCliente(cliente)}>Editar</Button>{' '}
                <Button variant="danger" onClick={() => eliminarCliente(cliente.id)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaClientes;
