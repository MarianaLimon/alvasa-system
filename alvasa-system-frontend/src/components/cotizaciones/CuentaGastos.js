import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const CuentaGastos = ({ onCuentaChange, datos = {} }) => {
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

  // Precargar datos en modo edición
  useEffect(() => {
    if (datos && Object.keys(datos).length > 0) {
      setData({
        honorarios: datos.honorarios ?? '',
        padron: datos.padron ?? '',
        serviciosComplementarios: datos.serviciosComplementarios ?? datos.servicios_complementarios ?? '',
        manejoCarga: datos.manejoCarga ?? datos.manejo_carga ?? '',
      });
      const subtotal =
        parseNumber(datos.honorarios) +
        parseNumber(datos.padron) +
        parseNumber(datos.serviciosComplementarios ?? datos.servicios_complementarios) +
        parseNumber(datos.manejoCarga ?? datos.manejo_carga);

      const total = subtotal * (1 + iva);
      setResultados({ subtotal, total });
    }
  }, [datos]);

  const {
    honorarios,
    padron,
    serviciosComplementarios,
    manejoCarga,
  } = data;

  useEffect(() => {
    const subtotal =
      parseNumber(honorarios) +
      parseNumber(padron) +
      parseNumber(serviciosComplementarios) +
      parseNumber(manejoCarga);

    const total = subtotal * (1 + iva);

    if (
      subtotal.toFixed(2) !== resultados.subtotal.toFixed(2) ||
      total.toFixed(2) !== resultados.total.toFixed(2)
    ) {
      const nuevosResultados = { subtotal, total };
      setResultados(nuevosResultados);

      if (onCuentaChange) {
        onCuentaChange({
          honorarios,
          padron,
          serviciosComplementarios,
          manejoCarga,
          subtotal,
          iva,
          total,
        });
      }
    }
  }, [
    honorarios,
    padron,
    serviciosComplementarios,
    manejoCarga,
    resultados,
    onCuentaChange,
  ]);

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
      <h5 className="mb-3 subform-title">Cuenta de Gastos</h5>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Honorarios</Form.Label>
            <Form.Control
              type="number"
              name="honorarios"
              value={honorarios}
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
              value={padron}
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
              value={serviciosComplementarios}
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
              value={manejoCarga}
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