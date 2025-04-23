import React, { useState, useEffect } from 'react';
import FormularioCliente from './FormularioCliente';
import ListaClientes from './ListaClientes';
import axios from 'axios';
import DetallesCliente from './DetallesCliente';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mensajeCargados, setMensajeCargados] = useState('');

  // Traer los clientes al cargar el componente
  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/clientes'); // Ajusta la URL si es necesario
        setClientes(response.data);
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      }
    };
    obtenerClientes();
  }, []);

  // Agregar un nuevo cliente
  const agregarCliente = async (nuevoCliente) => {
    try {
      const response = await axios.post('http://localhost:5000/clientes', nuevoCliente);
      setClientes([...clientes, response.data]);
      setMensajeCargados('Cliente agregado correctamente');
      setTimeout(() => setMensajeCargados(''), 3000); // Mensaje desaparece después de 3 segundos
    } catch (error) {
      console.error('Error al agregar cliente:', error);
    }
  };

  // Seleccionar un cliente
  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
  };

  return (
    <div className="container">
      <h1 className="my-4">Gestión de Clientes</h1>

      <div className="row">
        {/* Columna del formulario */}
        <div className="col-md-6">
          <FormularioCliente onSubmit={agregarCliente} />
        </div>

        {/* Columna de la lista de clientes */}
        <div className="col-md-6">
          {mensajeCargados && <div className="alert alert-success mt-3">{mensajeCargados}</div>}
          <ListaClientes clientes={clientes} />
        </div>
      </div>

      {/* Mostrar detalles del cliente seleccionado */}
      {clienteSeleccionado && <DetallesCliente cliente={clienteSeleccionado} />}
    </div>
  );
};

export default Clientes;