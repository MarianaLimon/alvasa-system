import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, InputGroup } from 'react-bootstrap';
import { BsSearch, BsPencil, BsTrash } from 'react-icons/bs';
import ModalEditarCliente from './ModalEditarCliente';

const ListaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [clienteEditando, setClienteEditando] = useState(null);

  const obtenerClientes = async () => {
    try {
      const respuesta = await axios.get('http://localhost:5050/clientes');
      setClientes(respuesta.data);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  const eliminarCliente = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    try {
      await axios.delete(`http://localhost:5050/clientes/${id}`);
      obtenerClientes(); // refrescar la lista
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
    }
  };

  const clientesFiltrados = clientes.filter((cliente) =>
    Object.values(cliente).some((valor) =>
      valor?.toString().toLowerCase().includes(filtro.toLowerCase())
    )
  );

  return (
    <>
      <InputGroup className="mb-3 buscador-clientes">
        <Form.Control
          placeholder="Buscar cliente..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <InputGroup.Text style={{ backgroundColor: '#17A2B8', color: 'white', border: '1px solid #17A2B8' }}>
          <BsSearch />
        </InputGroup.Text>
      </InputGroup>

      <Table  className="tabla-clientes">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nombre}</td>
              <td>{cliente.direccion}</td>
              <td>{cliente.telefono}</td>
              <td>{cliente.email}</td>
              <td>
                <div className="botones-acciones">
                  <Button size="sm" className="btn-warning btn-editar btn-editar-cliente btn-action"
                    onClick={() => setClienteEditando(cliente)} >
                    <BsPencil />
                  </Button>
                  <Button size="sm" className="btn-danger btn-eliminar btn-eliminar-cliente btn-action"
                    onClick={() => eliminarCliente(cliente.id)} >
                    <BsTrash />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {clienteEditando && (
        <ModalEditarCliente
          cliente={clienteEditando}
          onClose={() => setClienteEditando(null)}
          onSave={() => {
            setClienteEditando(null);
            obtenerClientes();
          }}
        />
      )}
    </>
  );
};

export default ListaClientes;