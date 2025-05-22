import React, { useEffect, useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const ContenedorSalidaRetorno = ({ onChange, datos = {} }) => {
  const [form, setForm] = useState({
    salidaAduana: '',
    entrega: '',
    fMax: '',
    entregaVacio: '',
    condicionesContenedor: '',
    terminalVacio: '',
  });

  useEffect(() => {
    if (datos && Object.keys(datos).length > 0) {
      setForm(prev => ({ ...prev, ...datos }));
    }
  }, [datos]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const nuevoValor = type === 'date' ? value : value.toUpperCase();
    const nuevoForm = { ...form, [name]: nuevoValor };
    setForm(nuevoForm);
    if (onChange) onChange(nuevoForm);
  };

  return (
    <div className="container-subform">
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Salida Aduana</Form.Label>
            <Form.Control type='date' name="salidaAduana" value={form.salidaAduana} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Entrega Cliente</Form.Label>
            <Form.Control  type='date' name="entrega" value={form.entrega} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>F. Max Retorno</Form.Label>
            <Form.Control type='date' name="fMax" value={form.fMax} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Entrega Vacío</Form.Label>
            <Form.Control type='date' name="entregaVacio" value={form.entregaVacio} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Condiciones Contenedor</Form.Label>
            <Form.Control type='text' name="condicionesContenedor" value={form.condicionesContenedor} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Terminal Vacío</Form.Label>
            <Form.Control type='text' name="terminalVacio" value={form.terminalVacio} onChange={handleChange} className="text-uppercase" />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default ContenedorSalidaRetorno;