import React from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { BsFilter, BsPrinter } from 'react-icons/bs';
import './ListaEstadoCuentaClientes.css';

const FiltrosEstadoCuentaClientes = ({
  clienteSeleccionado, setClienteSeleccionado,
  clientesUnicos,
  filtroEstatus, setFiltroEstatus,
  fechaDesde, setFechaDesde,
  fechaHasta, setFechaHasta,
  onLimpiarFiltros,
  onImprimir
}) => {
  return (
    <div className="d-flex flex-wrap justify-content-center gap-3 px-3 pb-3 mt-3">
      {/* Cliente */}
      <InputGroup style={{ width: '12rem' }}>
        <InputGroup.Text><BsFilter /></InputGroup.Text>
        <Form.Select
          value={clienteSeleccionado}
          onChange={(e) => setClienteSeleccionado(e.target.value)}
        >
          <option value="">Cliente</option>
          {clientesUnicos.map((cli, idx) => (
            <option key={idx} value={cli}>{cli}</option>
          ))}
        </Form.Select>
      </InputGroup>

      {/* Estatus */}
      <InputGroup style={{ width: '10rem' }}>
        <InputGroup.Text><BsFilter /></InputGroup.Text>
        <Form.Select
          value={filtroEstatus}
          onChange={(e) => setFiltroEstatus(e.target.value)}
        >
          <option value="">Estatus</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Pagado">Pagado</option>
        </Form.Select>
      </InputGroup>

      {/* Desde */}
      <InputGroup style={{ width: '13rem' }}>
        <InputGroup.Text>Desde</InputGroup.Text>
        <Form.Control
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
        />
      </InputGroup>

      {/* Hasta */}
      <InputGroup style={{ width: '13rem' }}>
        <InputGroup.Text>Hasta</InputGroup.Text>
        <Form.Control
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
        />
      </InputGroup>

      {/* Botones */}
      <div className="d-flex gap-2 align-items-center">
        <Button className="btn-limpiar-filtros" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
        <Button className="btn-generar-pdf" onClick={onImprimir}>
          <BsPrinter className="me-2" />
          Generar PDF
        </Button>
      </div>
    </div>
  );
};

export default FiltrosEstadoCuentaClientes;
