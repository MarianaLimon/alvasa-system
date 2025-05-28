import React, { useEffect, useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const Aseguradora = ({ datos = {}, onChange }) => {
  const [data, setData] = useState({
    aseguradora: '',
    valorMercancia: '',
    costo: '',
    venta: ''
  });

  useEffect(() => {
    if (datos && Object.keys(datos).length > 0) {
      setData({
        aseguradora: datos.aseguradora ?? '',
        valorMercancia: datos.valorMercancia ?? '',
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

      <Row className="mb-3">
        <Col md={4}>
          <Form.Label>Aseguradora</Form.Label>
          <Form.Select
            name="aseguradora"
            value={data.aseguradora}
            onChange={handleChange}
            className="text-uppercase"
          >
            <option value="">Seleccione...</option>
            <option value="LAVAP SEGUROS">LAVAP SEGUROS</option>
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Label>COSTO <span>MXN</span></Form.Label>
          <Form.Control
            type="number"
            name="costo"
            value={data.costo}
            onChange={handleChange}
            onKeyDown={soloNumeros}
          />
        </Col>
        <Col md={4}>
          <Form.Label>VENTA <span>MXN</span></Form.Label>
          <Form.Control
            type="number"
            name="venta"
            value={data.venta}
            onChange={handleChange}
            onKeyDown={soloNumeros}
          />
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Form.Label>Valor Mercancía <span>MXN</span></Form.Label>
          <Form.Control
            type="number"
            name="valorMercancia"
            value={data.valorMercancia}
            disabled
          />
        </Col>
      </Row>
    </div>
  );
};

export default Aseguradora;
