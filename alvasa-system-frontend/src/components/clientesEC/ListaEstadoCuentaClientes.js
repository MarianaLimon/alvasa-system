// src/components/estadoCuenta/ListaEstadoCuentaClientes.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from 'react-bootstrap';
import CardEstadoCuentaCliente from './CardEstadoCuentaCliente';
import FiltrosEstadoCuentaClientes from './FiltrosEstadoCuentaClientes';
import './ListaEstadoCuentaClientes.css';

const API = 'http://localhost:5050';

const ListaEstadoCuentaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // ---- fetch inicial / recarga reutilizable
  const cargarLista = async () => {
    const { data } = await axios.get(`${API}/estado-cuenta-clientes`);
    const clientesConSaldo = data.map((c) => ({
      ...c,
      // asegura saldo por si viene null
      saldo: Number(c.saldo ?? (Number(c.total || 0) - Number(c.abonado || 0))),
    }));
    setClientes(clientesConSaldo);
  };

  useEffect(() => {
    cargarLista().catch((e) =>
      console.error('Error al cargar estados de cuenta:', e)
    );
  }, []);

  // ---- filtros
  const clientesUnicos = [...new Set(clientes.map((c) => c.cliente))];

  const filtrados = clientes.filter((c) => {
    const coincideCliente = !clienteSeleccionado || c.cliente === clienteSeleccionado;
    const coincideEstatus = !filtroEstatus || c.estatus === filtroEstatus;
    const coincideFechaDesde = !fechaDesde || new Date(c.fecha_entrega) >= new Date(fechaDesde);
    const coincideFechaHasta = !fechaHasta || new Date(c.fecha_entrega) <= new Date(fechaHasta);
    return coincideCliente && coincideEstatus && coincideFechaDesde && coincideFechaHasta;
  });

  // ---- totales de la banda superior (se recalculan a partir de "filtrados")
  const totalVentas  = filtrados.reduce((acc, c) => acc + Number(c.total || 0), 0);
  const totalAbonado = filtrados.reduce((acc, c) => acc + Number(c.abonado || 0), 0);
  const totalSaldo   = filtrados.reduce((acc, c) => acc + Number(c.saldo || 0), 0);

  const limpiarFiltros = () => {
    setClienteSeleccionado('');
    setFiltroEstatus('');
    setFechaDesde('');
    setFechaHasta('');
  };

  const handleImprimir = () => {
    console.log('Imprimir cards filtrados:', filtrados);
  };

  // ---- 🔔 handler llamado por cada card cuando cambia un abono
  const onCambioAbonos = ({ idEstado, deltaAbono, totalesFila } = {}) => {
    setClientes((prev) =>
      prev.map((c) => {
        if (c.id_estado_cuenta !== idEstado) return c;

        // si el backend devolvió los totales de la fila, úsalo (más preciso)
        if (totalesFila) {
          const abonado = Number(totalesFila.abonado || 0);
          const saldo   = Number(totalesFila.saldo   || Math.max(Number(c.total || 0) - abonado, 0));
          const estatus = totalesFila.estatus || c.estatus;
          return { ...c, abonado, saldo, estatus };
        }

        // fallback: ajusta localmente con el delta
        const abonado = Number(c.abonado || 0) + Number(deltaAbono || 0);
        const saldo   = Math.max(Number(c.total || 0) - abonado, 0);
        const estatus = saldo <= 0 ? 'Pagado' : 'Pendiente';
        return { ...c, abonado, saldo, estatus };
      })
    );
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
          filtrados.map((cliente) => (
            <CardEstadoCuentaCliente
              key={cliente.id_estado_cuenta}   // clave estable
              data={cliente}
              onCambioAbonos={onCambioAbonos}  // 👈 pasa el callback al card
            />
          ))
        ) : (
          <p className="text-center py-4">No se encontraron resultados.</p>
        )}
      </Card.Body>
    </Card>
  );
};

export default ListaEstadoCuentaClientes;
