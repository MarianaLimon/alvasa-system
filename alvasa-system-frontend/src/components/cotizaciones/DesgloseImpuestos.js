import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const DesgloseImpuestos = ({ onImpuestosChange }) => {
  const [data, setData] = useState({
    valorFactura: '',
    flete: '',
    tipoCambio: '',
    igi: '',
    prv: 'No aplica',
    ivaPrv: 'No aplica',
  });

  const [resultados, setResultados] = useState({
    dta: 0,
    iva: 0,
    total: 0,
  });

  const parseNumber = (val) => parseFloat(val) || 0;

  useEffect(() => {
    const obtenerTipoCambio = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        const tipoCambioActual = data.rates.MXN;
        setData(prev => ({ ...prev, tipoCambio: tipoCambioActual.toFixed(2) }));
      } catch (error) {
        console.error('Error al obtener tipo de cambio:', error);
      }
    };
    obtenerTipoCambio();
  }, []);

  useEffect(() => {
    const valorFactura = parseNumber(data.valorFactura);
    const flete = parseNumber(data.flete);
    const tipoCambio = parseNumber(data.tipoCambio);
    const igi = parseNumber(data.igi);
    const prv = data.prv === '290 pesos mexicanos' ? 290 : 0;
    const ivaPrv = data.ivaPrv === '46 pesos mexicanos' ? 46 : 0;

    const dta = (valorFactura + flete) * tipoCambio;
    const iva = (valorFactura + dta + igi) * 0.16;
    const total = dta + igi + iva + prv + ivaPrv;

    const nuevosResultados = { dta, iva, total };
    setResultados(nuevosResultados);

    if (onImpuestosChange) {
      onImpuestosChange({ ...data, ...nuevosResultados });
    }
  }, [data, onImpuestosChange]);

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
      <h5 className="mb-3 subform-title">Desglose de Impuestos</h5>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Valor Factura</Form.Label>
            <Form.Control
              type="number"
              name="valorFactura"
              value={data.valorFactura}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Flete</Form.Label>
            <Form.Control
              type="number"
              name="flete"
              value={data.flete}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Tipo de Cambio</Form.Label>
            <Form.Control
              type="number"
              name="tipoCambio"
              value={data.tipoCambio}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>DTA (calculado)</Form.Label>
            <Form.Control value={`$${resultados.dta.toFixed(2)} MXN`} disabled />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>IGI (MXN)</Form.Label>
            <Form.Control
              type="number"
              name="igi"
              value={data.igi}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>IVA (calculado)</Form.Label>
            <Form.Control value={`$${resultados.iva.toFixed(2)} MXN`} disabled />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>PRV</Form.Label>
            <Form.Select name="prv" value={data.prv} onChange={handleChange}>
              <option>No aplica</option>
              <option>290 pesos mexicanos</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>IVA / PRV</Form.Label>
            <Form.Select name="ivaPrv" value={data.ivaPrv} onChange={handleChange}>
              <option>No aplica</option>
              <option>46 pesos mexicanos</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <div className="text-end mt-3">
        <strong>Total Impuestos: ${resultados.total.toFixed(2)} MXN</strong>
      </div>
    </div>
  );
};

export default DesgloseImpuestos;