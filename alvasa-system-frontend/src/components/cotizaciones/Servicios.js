import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const Servicios = ({ onServiciosChange }) => {
  const [data, setData] = useState({
    maniobras: '',
    revalidacion: '',
    gestionDestino: '',
    inspeccionPeritaje: '',
    documentacionImportacion: '',
    garantiaContenedores: '',
    distribucion: '',
    serentyPremium: '',
  });

  const [total, setTotal] = useState(0);

  const parseNumber = (val) => parseFloat(val) || 0;

  useEffect(() => {
    const suma = Object.values(data).reduce((acc, val) => acc + parseNumber(val), 0);
    setTotal(suma);
    if (onServiciosChange) {
      onServiciosChange({ ...data, total: suma });
    }
  }, [data, onServiciosChange]);

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
      <h5 className="mb-3">Servicios</h5>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Maniobras</Form.Label>
            <Form.Control
              type="number"
              name="maniobras"
              value={data.maniobras}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Revalidación</Form.Label>
            <Form.Control
              type="number"
              name="revalidacion"
              value={data.revalidacion}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Gestión Contenedores Destino</Form.Label>
            <Form.Control
              type="number"
              name="gestionDestino"
              value={data.gestionDestino}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>T. Inspección y Peritaje Contenedores</Form.Label>
            <Form.Control
              type="number"
              name="inspeccionPeritaje"
              value={data.inspeccionPeritaje}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>T. Documentación de Importación</Form.Label>
            <Form.Control
              type="number"
              name="documentacionImportacion"
              value={data.documentacionImportacion}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Garantía de Contenedores</Form.Label>
            <Form.Control
              type="number"
              name="garantiaContenedores"
              value={data.garantiaContenedores}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>T. Distribución</Form.Label>
            <Form.Control
              type="number"
              name="distribucion"
              value={data.distribucion}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Serenty PREMIUM</Form.Label>
            <Form.Control
              type="number"
              name="serentyPremium"
              value={data.serentyPremium}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex align-items-end justify-content-end">
          <strong>Total Servicios: ${total.toFixed(2)} USD</strong>
        </Col>
      </Row>
    </div>
  );
};

export default Servicios;