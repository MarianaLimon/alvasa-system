import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const FormularioDatosGenerales = ({ form, handleChange, clientes, setForm }) => {
  return (
    <Row>
      <Col md={4}>
        <Form.Group className="mb-3">
          <Form.Label>Cliente</Form.Label>
          <Form.Select name="cliente_id" value={form.cliente_id} onChange={handleChange} required>
            <option value="">Seleccionar cliente...</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Empresa</Form.Label>
          <Form.Control type="text" name="empresa" value={form.empresa} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Fecha</Form.Label>
          <Form.Control type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
        </Form.Group>
      </Col>

      <Col md={4}>
        <Form.Group className="mb-3">
          <Form.Label>Mercancía</Form.Label>
          <Form.Control type="text" name="mercancia" value={form.mercancia} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Régimen</Form.Label>
          <Form.Select name="regimen" value={form.regimen} onChange={handleChange}>
            <option value="">Seleccionar...</option>
            <option value="A1">A1</option>
            <option value="A4">A4</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Aduana</Form.Label>
          <Form.Select name="aduana" value={form.aduana} onChange={handleChange}>
            <option value="">Seleccionar...</option>
            <option value="AICM">AICM</option>
            <option value="Manzanillo">Manzanillo</option>
            <option value="Lazaro Cardenas">Lázaro Cárdenas</option>
            <option value="Long Beach">Long Beach</option>
            <option value="Progreso">Progreso</option>
            <option value="San Diego">San Diego</option>
            <option value="Veracruz">Veracruz</option>
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={4}>
        <Form.Group className="mb-3">
          <Form.Label>Tipo de Envío</Form.Label>
          <Form.Select
            name="tipo_envio"
            value={form.tipo_envio || ''}
            onChange={(e) => setForm({ ...form, tipo_envio: e.target.value })}
          >
            <option value="">Selecciona tipo de envío</option>
            <option value="Pallets">Pallets</option>
            <option value="Cajas">Cajas</option>
            <option value="Contenedor">Contenedor</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Cantidad</Form.Label>
          <Form.Control
            type="number"
            name="cantidad"
            value={form.cantidad}
            onChange={handleChange}
            min={0}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Estatus</Form.Label>
          <Form.Select name="estatus" value={form.estatus} onChange={handleChange} required>
            <option value="">Seleccionar...</option>
            <option value="Autorizada">Autorizada</option>
            <option value="En negociación">En negociación</option>
            <option value="Entregado a cliente">Entregado a cliente</option>
            <option value="Declinada">Declinada</option>
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>
  );
};

export default FormularioDatosGenerales;