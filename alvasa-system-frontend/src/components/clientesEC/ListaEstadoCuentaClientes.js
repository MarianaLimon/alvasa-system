import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from 'react-bootstrap';
import CardEstadoCuentaCliente from './CardEstadoCuentaCliente';
import FiltrosEstadoCuentaClientes from './FiltrosEstadoCuentaClientes';
import './ListaEstadoCuentaClientes.css';

const ListaEstadoCuentaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

useEffect(() => {
  const fetchData = async () => {
    try {
      // ❌ Ya no llamamos a la generación automática por POST

      // ✅ Solo obtenemos estados de cuenta ya existentes
      const { data } = await axios.get('http://localhost:5050/estado-cuenta-clientes');
      const clientesConSaldo = data.map(c => ({
        ...c,
        saldo: c.total - c.abonado // calcular saldo si es necesario
      }));
      setClientes(clientesConSaldo);
    } catch (error) {
      console.error('Error al cargar estados de cuenta:', error);
    }
  };

  fetchData();
}, []);



  const clientesUnicos = [...new Set(clientes.map(c => c.cliente))];

  const filtrados = clientes.filter(c => {
    const coincideCliente = clienteSeleccionado === '' || c.cliente === clienteSeleccionado;
    const coincideEstatus = filtroEstatus === '' || c.estatus === filtroEstatus;
    const coincideFechaDesde = fechaDesde === '' || new Date(c.fecha_entrega) >= new Date(fechaDesde);
    const coincideFechaHasta = fechaHasta === '' || new Date(c.fecha_entrega) <= new Date(fechaHasta);
    return coincideCliente && coincideEstatus && coincideFechaDesde && coincideFechaHasta;
  });

  const totalVentas = filtrados.reduce((acc, c) => acc + c.total, 0);
  const totalAbonado = filtrados.reduce((acc, c) => acc + c.abonado, 0);
  const totalSaldo = filtrados.reduce((acc, c) => acc + c.saldo, 0);

  const limpiarFiltros = () => {
    setClienteSeleccionado('');
    setFiltroEstatus('');
    setFechaDesde('');
    setFechaHasta('');
  };

  const handleImprimir = () => {
    console.log('Imprimir cards filtrados:', filtrados);
  };

  return (
    <Card className="mt-4 shadow-sm">
      <Card.Header>
        <h5 className="mb-2">Estado de Cuenta de Clientes</h5>
      </Card.Header>

      <FiltrosEstadoCuentaClientes
        clienteSeleccionado={clienteSeleccionado}
        setClienteSeleccionado={setClienteSeleccionado}
        clientesUnicos={clientesUnicos}
        filtroEstatus={filtroEstatus}
        setFiltroEstatus={setFiltroEstatus}
        fechaDesde={fechaDesde}
        setFechaDesde={setFechaDesde}
        fechaHasta={fechaHasta}
        setFechaHasta={setFechaHasta}
        onLimpiarFiltros={limpiarFiltros}
        onImprimir={handleImprimir}
      />

      <div className="totales-ec-container">
        <div className="totales-ec-box">
          <div className="totales-ec-item">
            Total vendido: <span className="text-primary total-ec-filter">${totalVentas.toLocaleString()}</span>
          </div>
          <div className="totales-ec-item">
            Total abonado: <span className="text-success total-ec-filter">${totalAbonado.toLocaleString()}</span>
          </div>
          <div className="totales-ec-item">
            Saldo total: <span className="text-danger total-ec-filter">${totalSaldo.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Card.Body className="p-0">
        {filtrados.length > 0 ? (
          filtrados.map((cliente, idx) => (
            <CardEstadoCuentaCliente key={idx} data={cliente} />
          ))
        ) : (
          <p className="text-center py-4">No se encontraron resultados.</p>
        )}
      </Card.Body>
    </Card>
  );
};

export default ListaEstadoCuentaClientes;
