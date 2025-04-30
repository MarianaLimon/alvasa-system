import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const CargosExtra = ({ onCargosExtraChange, datos = {} }) => {
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

  // Precargar datos en modo edición
  useEffect(() => {
    if (datos && Object.keys(datos).length > 0) {
      setData({
        almacenajes: datos.almacenajes ?? '',
        demoras: datos.demoras ?? '',
        pernocta: datos.pernocta ?? '',
        burreo: datos.burreo ?? '',
        fleteFalso: datos.fleteFalso ?? datos.flete_falso ?? '',
        servicioNoRealizado: datos.servicioNoRealizado ?? datos.servicio_no_realizado ?? '',
        seguro: datos.seguro ?? '',
      });
      setTotal(parseFloat(datos.total ?? 0));
    }
  }, [datos]);

  const {
    almacenajes,
    demoras,
    pernocta,
    burreo,
    fleteFalso,
    servicioNoRealizado,
    seguro,
  } = data;

  useEffect(() => {
    const suma = [
      parseNumber(almacenajes),
      parseNumber(demoras),
      parseNumber(pernocta),
      parseNumber(burreo),
      parseNumber(fleteFalso),
      parseNumber(servicioNoRealizado),
      parseNumber(seguro),
    ].reduce((acc, val) => acc + val, 0);

    if (suma.toFixed(2) !== total.toFixed(2)) {
      setTotal(suma);
      if (onCargosExtraChange) {
        onCargosExtraChange({
          almacenajes,
          demoras,
          pernocta,
          burreo,
          fleteFalso,
          servicioNoRealizado,
          seguro,
          total: suma,
        });
      }
    }
  }, [
    almacenajes,
    demoras,
    pernocta,
    burreo,
    fleteFalso,
    servicioNoRealizado,
    seguro,
    total,
    onCargosExtraChange,
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
      <h5 className="mb-3 subform-title">Cargos Extra</h5>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Almacenajes</Form.Label>
            <Form.Control
              type="number"
              name="almacenajes"
              value={almacenajes}
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
              value={demoras}
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
              value={pernocta}
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
              value={burreo}
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
              value={fleteFalso}
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
              value={servicioNoRealizado}
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
              value={seguro}
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