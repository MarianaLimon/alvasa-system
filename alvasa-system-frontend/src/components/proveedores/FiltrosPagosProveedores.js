import React from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { BsFilter} from 'react-icons/bs';

const FiltrosPagosProveedores = ({
  proveedorSeleccionado, setProveedorSeleccionado,
  proveedoresUnicos,
  filtroEstatus, setFiltroEstatus,
  fechaDesde, setFechaDesde,
  fechaHasta, setFechaHasta,
  giroSeleccionado, setGiroSeleccionado,
  girosUnicos,
  conceptoSeleccionado, setConceptoSeleccionado,
  conceptosPorGiro,
  onLimpiarFiltros
}) => {
  return (
    <div className="d-flex flex-wrap gap-3 px-3 pb-3 mt-2">
      <InputGroup style={{ width: '12rem' }}>
        <InputGroup.Text><BsFilter /></InputGroup.Text>
        <Form.Select
          value={proveedorSeleccionado}
          onChange={(e) => setProveedorSeleccionado(e.target.value)}
        >
          <option value="">Proveedor</option>
          {proveedoresUnicos.map((prov, idx) => (
            <option key={idx} value={prov}>{prov}</option>
          ))}
        </Form.Select>
      </InputGroup>

      <InputGroup style={{ width: '10rem' }}>
        <InputGroup.Text><BsFilter /></InputGroup.Text>
        <Form.Select
          value={filtroEstatus}
          onChange={(e) => setFiltroEstatus(e.target.value)}
        >
          <option value="">Estatus</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Saldado">Saldado</option>
        </Form.Select>
      </InputGroup>

      <InputGroup style={{ width: '10rem' }}>
        <InputGroup.Text><BsFilter /></InputGroup.Text>
        <Form.Select
          value={giroSeleccionado}
          onChange={(e) => {
            setGiroSeleccionado(e.target.value);
            setConceptoSeleccionado('');
          }}
        >
          <option value="">Giro</option>
          {girosUnicos.map((giro, idx) => (
            <option key={idx} value={giro}>{giro}</option>
          ))}
        </Form.Select>
      </InputGroup>

      <InputGroup style={{ width: '11rem' }}>
        <InputGroup.Text><BsFilter /></InputGroup.Text>
        <Form.Select
          value={conceptoSeleccionado}
          onChange={(e) => setConceptoSeleccionado(e.target.value)}
          disabled={!giroSeleccionado}
        >
          <option value="">Concepto</option>
          {(conceptosPorGiro[giroSeleccionado] || []).map((concepto, idx) => (
            <option key={idx} value={concepto}>{concepto}</option>
          ))}
        </Form.Select>
      </InputGroup>

      <InputGroup style={{ width: '14rem' }}>
        <InputGroup.Text>Desde</InputGroup.Text>
        <Form.Control
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
        />
      </InputGroup>

      <InputGroup style={{ width: '14rem' }}>
        <InputGroup.Text>Hasta</InputGroup.Text>
        <Form.Control
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
        />
      </InputGroup>

      <div className="d-flex gap-2">
  <Button variant="outline-secondary" onClick={onLimpiarFiltros}>
    Limpiar filtros
  </Button>
  
</div>

    </div>
  );
};

export default FiltrosPagosProveedores;