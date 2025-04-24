import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const CuentaGastos = ({ onCuentaChange }) => {
  const [data, setData] = useState({
    honorarios: '',
    padron: '',
    serviciosComplementarios: '',
    manejoCarga: '',
  });

  const iva = 0.16;
  const [resultados, setResultados] = useState({
    subtotal: 0,
    total: 0,
  });

  const parseNumber = (val) => parseFloat(val) || 0;

  useEffect(() => {
    const subtotal =
      parseNumber(data.honorarios) +
      parseNumber(data.padron) +
      parseNumber(data.serviciosComplementarios) +
      parseNumber(data.manejoCarga);

    const total = subtotal * (1 + iva);
    const nuevosResultados = { subtotal, total };

    setResultados(nuevosResultados);
    if (onCuentaChange) onCuentaChange({ ...data, subtotal, iva, total });
  }, [data, onCuentaChange]);

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
    <div className="p-3 mt-4 rounded" style={{ backgroundColor: '#3a3f44', color: 'white' }}>
      <h5 className="mb-3">Cuenta de Gastos</h5>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Honorarios</Form.Label>
            <Form.Control
              type="number"
              name="honorarios"
              value={data.honorarios}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Padrón</Form.Label>
            <Form.Control
              type="number"
              name="padron"
              value={data.padron}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Servicios Complementarios</Form.Label>
            <Form.Control
              type="number"
              name="serviciosComplementarios"
              value={data.serviciosComplementarios}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Manejo de Carga</Form.Label>
            <Form.Control
              type="number"
              name="manejoCarga"
              value={data.manejoCarga}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <strong>Subtotal: ${resultados.subtotal.toFixed(2)} MXN</strong>
        </Col>
        <Col md={4}>
          <strong>IVA (16%): ${(resultados.subtotal * iva).toFixed(2)} MXN</strong>
        </Col>
        <Col md={4} className="text-end">
          <strong>Total: ${resultados.total.toFixed(2)} MXN</strong>
        </Col>
      </Row>
    </div>
  );
};

export default CuentaGastos;
