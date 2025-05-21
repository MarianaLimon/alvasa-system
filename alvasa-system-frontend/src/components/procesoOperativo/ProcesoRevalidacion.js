import React, { useEffect, useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const ProcesoRevalidacion = ({ onChange, datos = {} }) => {
  const [form, setForm] = useState({
    mbl: '',
    eta: '',
    descarga: '',
    terminal: '',
    revalidacion: '',
    recepcionEnvioDocs: '',
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
        <Col md={4}>
          <Form.Group>
            <Form.Label>MBL</Form.Label>
            <Form.Control name="mbl" value={form.mbl} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>ETA</Form.Label>
            <Form.Control type="text" name="eta" value={form.eta} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Descarga</Form.Label>
            <Form.Control name="descarga" value={form.descarga} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Terminal</Form.Label>
            <Form.Select name="terminal" value={form.terminal} onChange={handleChange} className="text-uppercase">
              <option value="">Seleccionar</option>
              <option value="LCT">LCT</option>
              <option value="APM">APM</option>
              <option value="N/A">N/A</option>
              <option value="FEDEX">FEDEX</option>
              <option value="ICAVE">ICAVE</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Revalidación</Form.Label>
            <Form.Control name="revalidacion" value={form.revalidacion} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>F. Recepción y envío de Docum.</Form.Label>
            <Form.Control name="recepcionEnvioDocs" value={form.recepcionEnvioDocs} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default ProcesoRevalidacion;