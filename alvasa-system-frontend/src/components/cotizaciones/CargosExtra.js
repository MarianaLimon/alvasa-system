import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const CargosExtra = ({ onCargosExtraChange }) => {
  const [data, setData] = useState({
    almacenajes: '',
    demoras: '',
    pernocta: '',
    burreo: '',
    fleteFalso: '',
    servicioNoRealizado: '',
    seguro: '',
  });

  const [total, setTotal] = useState(0);

  const parseNumber = (val) => parseFloat(val) || 0;

  useEffect(() => {
    const suma = Object.values(data).reduce((acc, val) => acc + parseNumber(val), 0);
    setTotal(suma);
    if (onCargosExtraChange) {
      onCargosExtraChange({ ...data, total: suma });
    }
  }, [data, onCargosExtraChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const soloNumeros = (e) => {
    if (!/[0-9.]|Backspace|Tab|ArrowLeft|ArrowRight/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="container-subform">
      <h5 className="mb-3 subform-title">Cargos Extra</h5>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Almacenajes</Form.Label>
            <Form.Control
              type="number"
              name="almacenajes"
              value={data.almacenajes}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Demoras</Form.Label>
            <Form.Control
              type="number"
              name="demoras"
              value={data.demoras}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Pernocta</Form.Label>
            <Form.Control
              type="number"
              name="pernocta"
              value={data.pernocta}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Burreo</Form.Label>
            <Form.Control
              type="number"
              name="burreo"
              value={data.burreo}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Flete en Falso</Form.Label>
            <Form.Control
              type="number"
              name="fleteFalso"
              value={data.fleteFalso}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Servicio No Realizado</Form.Label>
            <Form.Control
              type="number"
              name="servicioNoRealizado"
              value={data.servicioNoRealizado}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Seguro</Form.Label>
            <Form.Control
              type="number"
              name="seguro"
              value={data.seguro}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={8} className="d-flex align-items-end justify-content-end total-cargos-extra">
          <strong>Total Cargos Extra: ${total.toFixed(2)} USD</strong>
        </Col>
      </Row>
    </div>
  );
};

export default CargosExtra;