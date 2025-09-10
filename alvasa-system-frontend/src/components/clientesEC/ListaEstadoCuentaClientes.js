import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Form, InputGroup } from 'react-bootstrap';
import { BsSearch } from 'react-icons/bs';
import CardEstadoCuentaCliente from './CardEstadoCuentaCliente';
import FiltrosEstadoCuentaClientes from './FiltrosEstadoCuentaClientes';
import './styles/ListaEstadoCuentaClientes.css';

const API = 'http://localhost:5050';

const ListaEstadoCuentaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [busqueda, setBusqueda] = useState(''); // 🔎 buscador (igual que proveedores)

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

  const filtrados = clientes
    // 🔎 filtro de texto (cliente, proveedor, no. control, folio, contenedor, etc.)
    .filter((c) => {
      const q = busqueda.trim().toLowerCase();
      if (!q) return true;
      return (
        c.cliente?.toLowerCase().includes(q) ||
        c.proveedor?.toLowerCase().includes(q) || // por si existe
        String(c.numero_control ?? '').toLowerCase().includes(q) ||
        String(c.folio_proceso ?? '').toLowerCase().includes(q) ||
        String(c.contenedor ?? '').toLowerCase().includes(q) ||
        c.mercancia?.toLowerCase().includes(q) ||
        c.servicio?.toLowerCase().includes(q) ||
        c.giro?.toLowerCase().includes(q) ||
        c.concepto?.toLowerCase().includes(q) ||
        c.estatus?.toLowerCase().includes(q)
      );
    })
    .filter((c) => {
      const coincideCliente = !clienteSeleccionado || c.cliente === clienteSeleccionado;
      const coincideEstatus = !filtroEstatus || c.estatus === filtroEstatus;
      const coincideDesde = !fechaDesde || new Date(c.fecha_entrega) >= new Date(fechaDesde);
      const coincideHasta = !fechaHasta || new Date(c.fecha_entrega) <= new Date(fechaHasta);
      return coincideCliente && coincideEstatus && coincideDesde && coincideHasta;
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
    setBusqueda(''); // limpia el buscador también
  };

  const handleImprimir = () => {
    const params = new URLSearchParams();
    if (clienteSeleccionado) params.append('cliente', clienteSeleccionado);
    if (filtroEstatus)       params.append('estatus', filtroEstatus);
    if (fechaDesde)          params.append('desde',  fechaDesde);
    if (fechaHasta)          params.append('hasta',  fechaHasta);
    if (busqueda)            params.append('q', busqueda);

    window.open(`${API}/estado-cuenta/pdf/filtrado?${params.toString()}`, '_blank');
  };

  // ---- 🔔 handler llamado por cada card cuando cambia un abono
  const onCambioAbonos = ({ idEstado, deltaAbono, totalesFila } = {}) => {
    setClientes((prev) =>
      prev.map((c) => {
        if (c.id_estado_cuenta !== idEstado) return c;

        if (totalesFila) {
          const abonado = Number(totalesFila.abonado || 0);
          const saldo   = Number(totalesFila.saldo   || Math.max(Number(c.total || 0) - abonado, 0));
          const estatus = totalesFila.estatus || c.estatus;
          return { ...c, abonado, saldo, estatus };
        }

        const abonado = Number(c.abonado || 0) + Number(deltaAbono || 0);
        const saldo   = Math.max(Number(c.total || 0) - abonado, 0);
        const estatus = saldo <= 0 ? 'Pagado' : 'Pendiente';
        return { ...c, abonado, saldo, estatus };
      })
    );
  };

  return (
    <div className='container-ecc'>
      <div className='header-ecc'>
        <div className="mt-5 mb-2 d-flex justify-content-between align-items-center flex-wrap">
          <h5 className="title mb-2">Estado de Cuenta de Clientes</h5>

          {/* 🔎 Buscador al estilo "Lista de proveedores" */}
          <InputGroup style={{ maxWidth: 250 }}>
            <Form.Control
              type="text"
              placeholder="Buscar"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <InputGroup.Text className="btn-buscar"><BsSearch /></InputGroup.Text>
          </InputGroup>
        </div>
      </div>

      <Card className="mt-4 shadow-sm card-gral-ecc">
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
                key={cliente.id_estado_cuenta}
                data={cliente}
                onCambioAbonos={onCambioAbonos}
              />
            ))
          ) : (
            <p className="text-center py-4">No se encontraron resultados.</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ListaEstadoCuentaClientes;
