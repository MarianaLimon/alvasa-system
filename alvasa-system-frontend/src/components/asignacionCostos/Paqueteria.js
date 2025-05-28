import React, { useEffect, useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const Paqueteria = ({ datos = {}, onChange }) => {
  const [data, setData] = useState({
    empresa: '',
    costo: '',
    venta: ''
  });

  useEffect(() => {
    if (datos && Object.keys(datos).length > 0) {
      setData({
        empresa: datos.empresa ?? '',
        costo: datos.costo ?? '',
        venta: datos.venta ?? ''
      });
    }
  }, [datos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevoData = { ...data, [name]: value };
    setData(nuevoData);
    if (onChange) onChange(nuevoData);
  };

  const soloNumeros = (e) => {
    if (!/[0-9.]|Backspace|Tab|ArrowLeft|ArrowRight/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="container-subform">

      <Row className="mb-2">
        <Col md={4}><Form.Label>Empresa Paquetería</Form.Label></Col>
        <Col md={4}><Form.Label>COSTO <span>MXN</span></Form.Label></Col>
        <Col md={4}><Form.Label>VENTA <span>MXN</span></Form.Label></Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Select
            name="empresa"
            value={data.empresa}
            onChange={handleChange}
            className="text-uppercase"
          >
            <option value="">Seleccione...</option>
            <option value="DHL">DHL</option>
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Control
            type="number"
            name="costo"
            value={data.costo}
            onChange={handleChange}
            onKeyDown={soloNumeros}
          />
        </Col>
        <Col md={4}>
          <Form.Control
            type="number"
            name="venta"
            value={data.venta}
            onChange={handleChange}
            onKeyDown={soloNumeros}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Paqueteria;