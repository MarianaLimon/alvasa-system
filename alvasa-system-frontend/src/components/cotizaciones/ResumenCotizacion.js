import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const ResumenCotizacion = ({ datosTotales, onResumenChange, datos = {} }) => {
  const [propuesta, setPropuesta] = useState('');
  const [fraccion_igi, setFraccionIgi] = useState('');
  const [monto_comisionista, setMontoComisionista] = useState('');
  const [notas, setNotas] = useState('');
  const [ahorro, setAhorro] = useState(0);
  const [costo_despacho, setCostoDespacho] = useState('');

  const parseNumber = (val) => parseFloat(val) || 0;

  // Precarga de datos en modo edición (usando nombres exactos del backend)
  useEffect(() => {
    if (datos && Object.keys(datos).length > 0) {
      setPropuesta(datos.propuesta ?? '');
      setFraccionIgi(datos.fraccion_igi ?? '');
      setMontoComisionista(datos.monto_comisionista ?? '');
      setNotas(datos.notas ?? '');
      setAhorro(parseFloat(datos.ahorro ?? 0));
      setCostoDespacho(datos.costo_despacho ?? '');
    }
  }, [datos]);

  // Total general (usa el del backend si está presente)
  const totalGeneral =
    datos && datos.total != null && !isNaN(parseFloat(datos.total))
      ? parseFloat(datos.total)
      : [
          datosTotales?.impuestos,
          datosTotales?.servicios,
          datosTotales?.cuentaGastos
        ].reduce((acc, item) => acc + (parseFloat(item?.total) || 0), 0);

  useEffect(() => {
    const nuevoAhorro = totalGeneral - parseNumber(propuesta);
    if (nuevoAhorro.toFixed(2) !== ahorro.toFixed(2)) {
      setAhorro(nuevoAhorro);
    }

    if (onResumenChange) {
      onResumenChange({
        propuesta,
        total: totalGeneral,
        ahorro: nuevoAhorro,
        fraccion_igi,
        monto_comisionista,
        notas,
        costo_despacho
      });
    }
  }, [
    totalGeneral,
    propuesta,
    fraccion_igi,
    monto_comisionista,
    notas,
    ahorro,
    costo_despacho,
    onResumenChange,
  ]);

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
            <Form.Control
              value={`$${totalGeneral.toFixed(2)} MXN`}
              disabled
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Propuesta</Form.Label>
            <Form.Control
              type="number"
              placeholder="$"
              value={propuesta}
              onChange={(e) => setPropuesta(e.target.value)}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
          {parseNumber(propuesta) > 0 ? (
            <strong>Ahorro: ${ahorro.toFixed(2)} MXN</strong>
          ) : (
            <span className="text-muted">Introduce una propuesta para calcular el ahorro</span>
          )}
        </Col>
        <Col md={4} >
          <Form.Group>
            <Form.Label>Costo Despacho</Form.Label>
            <Form.Control
              type="number"
              placeholder="$"
              value={costo_despacho}
              onChange={(e) => setCostoDespacho(e.target.value)}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
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
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Fracción / %IGI</Form.Label>
            <Form.Control
              as="textarea"
              rows={1}
              placeholder="Escribe aquí..."
              value={fraccion_igi.toUpperCase()} 
              onChange={(e) => setFraccionIgi(e.target.value.toUpperCase())} 
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default ResumenCotizacion;