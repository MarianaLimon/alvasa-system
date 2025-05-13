import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Row, Col } from 'react-bootstrap';

// Usar una API de tipo de cambio alternativa y gratuita
const EXCHANGE_API_URL =
  process.env.REACT_APP_EXCHANGE_API_URL ||
  'https://api.exchangerate-api.com/v4/latest/USD';

const DesgloseImpuestos = ({ onImpuestosChange, datos = {} }) => {
  const [data, setData] = useState({
    valorFactura: '',
    flete: '',
    tipoCambio: '',
    valorAduana: 0, // nuevo campo
    igi: '',
    prv: 'No aplica',
    ivaPrv: 'No aplica',
    dta: 0,
    iva: 0,
    total: 0,
  });

  const parseNumber = (val) => parseFloat(val) || 0;

  // Precarga de datos en edición
  useEffect(() => {
    if (datos && Object.keys(datos).length > 0) {
      setData({
        valorFactura: datos.valorFactura ?? datos.valor_factura ?? '',
        flete: datos.flete ?? '',
        tipoCambio: datos.tipoCambio ?? datos.tipo_cambio ?? '',
        valorAduana: parseNumber(datos.valorAduana ??((parseNumber(datos.valorFactura) + parseNumber(datos.flete)) * parseNumber(datos.tipoCambio))),
        igi: datos.igi ?? '',
        prv: datos.prv ?? 'No aplica',
        ivaPrv: datos.ivaPrv ?? 'No aplica',
        dta: parseNumber(datos.dta ?? 0),
        iva: parseNumber(datos.iva ?? 0),
        total: parseNumber(datos.total ?? 0),
      });
    }
  }, [datos]);

  // Obtener tipo de cambio al montar (solo modo creación)
  useEffect(() => {
    if (!datos || Object.keys(datos).length === 0) {
      axios
        .get(EXCHANGE_API_URL)
        .then((res) => {
          // Con API v4 recibimos un objeto con propiedad rates
          const rate = res.data.rates?.MXN;
          if (rate) {
            setData((prev) => ({ ...prev, tipoCambio: rate }));
          } else {
            console.error('Respuesta inesperada de la API:', res.data);
          }
        })
        .catch((err) => console.error('Error al obtener tipo de cambio:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    valorFactura,
    flete,
    tipoCambio,
    igi,
    prv,
    ivaPrv,
    dta: dtaActual,
    iva: ivaActual,
    total: totalActual,
  } = data;

  // Cálculo de impuestos
  useEffect(() => {
    const valorAduanaCalculado = (parseNumber(valorFactura) + parseNumber(flete)) * parseNumber(tipoCambio);
    const dta = parseNumber(valorAduanaCalculado) * 0.008;
    const iva = (parseNumber(valorAduanaCalculado) + dta + parseNumber(igi)) * 0.16;
    const total =
      dta +
      parseNumber(igi) +
      iva +
      (prv === '290 pesos mexicanos' ? 290 : 0) +
      (ivaPrv === '46 pesos mexicanos' ? 46 : 0);

    if (
        valorAduanaCalculado.toFixed(2) !== data.valorAduana?.toFixed(2) ||
        dta.toFixed(2) !== dtaActual.toFixed(2) ||
        iva.toFixed(2) !== ivaActual.toFixed(2) ||
        total.toFixed(2) !== totalActual.toFixed(2)
    ) {
      setData((prev) => ({ ...prev, valorAduana: valorAduanaCalculado, dta, iva, total }));
      onImpuestosChange?.({ valorFactura, flete, tipoCambio, valorAduana: valorAduanaCalculado, igi, prv, ivaPrv, dta, iva, total });
    }
  }, [valorFactura, flete, tipoCambio, igi, prv, ivaPrv, dtaActual, ivaActual, totalActual, data.valorAduana, onImpuestosChange]);

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
              value={valorFactura}
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
              value={flete}
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
              value={tipoCambio}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Valor Aduana (calculado)</Form.Label>
            <Form.Control value={`$${data.valorAduana.toFixed(2)} MXN`} disabled />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>DTA (calculado)</Form.Label>
            <Form.Control value={`$${dtaActual.toFixed(2)} MXN`} disabled />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>IGI (MXN)</Form.Label>
            <Form.Control
              type="number"
              name="igi"
              value={igi}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>IVA (calculado)</Form.Label>
            <Form.Control value={`$${ivaActual.toFixed(2)} MXN`} disabled />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>PRV</Form.Label>
            <Form.Select name="prv" value={prv} onChange={handleChange}>
              <option>No aplica</option>
              <option>290 pesos mexicanos</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>IVA / PRV</Form.Label>
            <Form.Select name="ivaPrv" value={ivaPrv} onChange={handleChange}>
              <option>No aplica</option>
              <option>46 pesos mexicanos</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <div className="text-end mt-3">
        <strong>Total Impuestos: ${totalActual.toFixed(2)} MXN</strong>
      </div>
    </div>
  );
};

export default DesgloseImpuestos;
