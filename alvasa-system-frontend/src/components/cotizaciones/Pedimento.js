import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const Pedimento = ({ onPedimentoChange }) => {
  const [data, setData] = useState({
    tipoCambio: '',
    pesoBruto: '',
    valorAduana: '',
    dta: '',
    ivaPrv: '',
    igiIge: '',
    prv: '',
    iva: '',
  });

  const [total, setTotal] = useState(0);

  const parseNumber = (val) => parseFloat(val) || 0;

  useEffect(() => {
    const suma =
      parseNumber(data.tipoCambio) +
      parseNumber(data.pesoBruto) +
      parseNumber(data.valorAduana) +
      parseNumber(data.dta) +
      parseNumber(data.ivaPrv) +
      parseNumber(data.igiIge) +
      parseNumber(data.prv) +
      parseNumber(data.iva);

    setTotal(suma);
    if (onPedimentoChange) onPedimentoChange({ ...data, total: suma });
  }, [data, onPedimentoChange]);

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
      <h5 className="mb-3">Pedimento</h5>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Tipo de Cambio</Form.Label>
            <Form.Control type="number" name="tipoCambio" value={data.tipoCambio} onChange={handleChange} onKeyDown={soloNumeros} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Peso Bruto</Form.Label>
            <Form.Control type="number" name="pesoBruto" value={data.pesoBruto} onChange={handleChange} onKeyDown={soloNumeros} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Valor Aduana</Form.Label>
            <Form.Control type="number" name="valorAduana" value={data.valorAduana} onChange={handleChange} onKeyDown={soloNumeros} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>DTA</Form.Label>
            <Form.Control type="number" name="dta" value={data.dta} onChange={handleChange} onKeyDown={soloNumeros} />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>IVA-PRV</Form.Label>
            <Form.Control type="number" name="ivaPrv" value={data.ivaPrv} onChange={handleChange} onKeyDown={soloNumeros} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>IGI-IGE</Form.Label>
            <Form.Control type="number" name="igiIge" value={data.igiIge} onChange={handleChange} onKeyDown={soloNumeros} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>PRV</Form.Label>
            <Form.Control type="number" name="prv" value={data.prv} onChange={handleChange} onKeyDown={soloNumeros} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>IVA</Form.Label>
            <Form.Control type="number" name="iva" value={data.iva} onChange={handleChange} onKeyDown={soloNumeros} />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={12} className="text-end">
          <strong>Total: ${total.toFixed(2)} MXN</strong>
        </Col>
      </Row>
    </div>
  );
};

export default Pedimento;