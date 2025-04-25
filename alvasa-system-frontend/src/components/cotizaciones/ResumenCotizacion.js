import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const ResumenCotizacion = ({ datosTotales, onResumenChange }) => {
  const [propuesta, setPropuesta] = useState('');
  const [fraccion_igi, setFraccionIgi] = useState('');
  const [monto_comisionista, setMontoComisionista] = useState('');
  const [notas, setNotas] = useState('');
  const [ahorro, setAhorro] = useState(0);

  const parseNumber = (val) => parseFloat(val) || 0;

  const totalGeneral = [
    datosTotales.flete,
    datosTotales.cargos,
    datosTotales.impuestos,
    datosTotales.cargosExtra,
    datosTotales.servicios,
    datosTotales.cuentaGastos,
    datosTotales.pedimento
  ].reduce((acc, item) => acc + (item?.total || 0), 0);

  useEffect(() => {
    const nuevoAhorro = totalGeneral - parseNumber(propuesta);
    setAhorro(nuevoAhorro);

    if (onResumenChange) {
      onResumenChange({
        propuesta,
        total: totalGeneral,  // 👈 ahora sí mandamos el total
        ahorro: nuevoAhorro,
        fraccion_igi,
        monto_comisionista,
        notas
      });
    }
  }, [totalGeneral, propuesta, fraccion_igi, monto_comisionista, notas, onResumenChange]);

  const soloNumeros = (e) => {
    if (!/[0-9.]|Backspace|Tab|ArrowLeft|ArrowRight/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="p-3 mt-4 rounded">
      <h5 className="mb-3 title-resumen">Resumen Cotización</h5>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Total General</Form.Label>
            <Form.Control value={`$${totalGeneral.toFixed(2)} MXN`} disabled />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Propuesta</Form.Label>
            <Form.Control
              type="number"
              value={propuesta}
              onChange={(e) => setPropuesta(e.target.value)}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex align-items-end">
          <strong>Ahorro: ${ahorro.toFixed(2)} MXN</strong>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Fracción / %IGI</Form.Label>
            <Form.Control
              as="textarea"
              rows={1}
              placeholder="Escribe aquí..."
              value={fraccion_igi}
              onChange={(e) => setFraccionIgi(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Monto del comisionista</Form.Label>
            <Form.Control
              type="number"
              placeholder="$"
              value={monto_comisionista}
              onChange={(e) => setMontoComisionista(e.target.value)}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Notas</Form.Label>
            <Form.Control
              as="textarea"
              rows={1}
              placeholder="Notas adicionales..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default ResumenCotizacion;