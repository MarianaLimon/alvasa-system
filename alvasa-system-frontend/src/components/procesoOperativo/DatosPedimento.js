import React, { useEffect, useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const DatosPedimento = ({ onChange, datos = {} }) => {
  const [form, setForm] = useState({
    pedimento: '',
    pagoPedimento: '',
    regimen: '',
    aaDespacho: '',
    agenteAduanal: '',
  });

  useEffect(() => {
    if (datos && Object.keys(datos).length > 0) {
      setForm(prev => ({ ...prev, ...datos }));
    }
  }, [datos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevoValor = value.toUpperCase();
    const nuevoForm = { ...form, [name]: nuevoValor };
    setForm(nuevoForm);
    if (onChange) onChange(nuevoForm);
  };

  return (
    <div>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Pedimento</Form.Label>
            <Form.Control
              name="pedimento"
              value={form.pedimento}
              onChange={handleChange}
              className="text-uppercase"
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Pago Pedimento</Form.Label>
            <Form.Control
              name="pagoPedimento"
              value={form.pagoPedimento}
              onChange={handleChange}
              className="text-uppercase"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Régimen</Form.Label>
            <Form.Select
              name="regimen"
              value={form.regimen}
              onChange={handleChange}
              className="text-uppercase"
            >
              <option value="">Seleccionar</option>
              <option value="IMMEX">IMMEX</option>
              <option value="N/A">N/A</option>
              <option value="A4">A4</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>AA Despacho</Form.Label>
            <Form.Select
              name="aaDespacho"
              value={form.aaDespacho}
              onChange={handleChange}
              className="text-uppercase"
            >
              <option value="">Seleccionar</option>
              <option value="GRUPOADUANAL">GRUPOADUANAL</option>
              <option value="BAJA IMPORT">BAJA IMPORT</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Agente Aduanal</Form.Label>
            <Form.Select
              name="agenteAduanal"
              value={form.agenteAduanal}
              onChange={handleChange}
              className="text-uppercase"
            >
              <option value="">Seleccionar</option>
              <option value="HUGO GUILLERMO AGUILERA MEDRANO 3359">HUGO GUILLERMO AGUILERA MEDRANO 3359</option>
              <option value="AGUSTIN LARES HOPKINS 3051">AGUSTIN LARES HOPKINS 3051</option>
              <option value="N/A">N/A</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default DatosPedimento;
