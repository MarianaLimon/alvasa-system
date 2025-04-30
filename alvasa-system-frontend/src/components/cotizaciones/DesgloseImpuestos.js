import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const DesgloseImpuestos = ({ onImpuestosChange, datos = {} }) => {
  const [data, setData] = useState({
    valorFactura: '',
    flete: '',
    tipoCambio: '',
    igi: '',
    prv: 'No aplica',
    ivaPrv: 'No aplica',
    dta: 0,
    iva: 0,
    total: 0,
  });

  const parseNumber = (val) => parseFloat(val) || 0;

  useEffect(() => {
    if (datos && Object.keys(datos).length > 0) {
      setData({
        valorFactura: datos.valorFactura ?? datos.valor_factura ?? '',
        flete: datos.flete ?? '',
        tipoCambio: datos.tipoCambio ?? datos.tipo_cambio ?? '',
        igi: datos.igi ?? '',
        prv: datos.prv ?? 'No aplica',
        ivaPrv: datos.ivaPrv ?? 'No aplica',
        dta: parseFloat(datos.dta ?? 0),
        iva: parseFloat(datos.iva ?? 0),
        total: parseFloat(datos.total ?? 0),
      });
    }
  }, [datos]);

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

  useEffect(() => {
    const dta = (parseNumber(valorFactura) + parseNumber(flete)) * parseNumber(tipoCambio);
    const iva = (parseNumber(valorFactura) + dta + parseNumber(igi)) * 0.16;
    const total =
      dta +
      parseNumber(igi) +
      iva +
      (prv === '290 pesos mexicanos' ? 290 : 0) +
      (ivaPrv === '46 pesos mexicanos' ? 46 : 0);

    // Solo actualiza si los valores cambiaron
    if (
      dta.toFixed(2) !== dtaActual.toFixed(2) ||
      iva.toFixed(2) !== ivaActual.toFixed(2) ||
      total.toFixed(2) !== totalActual.toFixed(2)
    ) {
      const resultados = { dta, iva, total };
      setData((prev) => ({ ...prev, ...resultados }));

      if (onImpuestosChange) {
        onImpuestosChange({
          valorFactura,
          flete,
          tipoCambio,
          igi,
          prv,
          ivaPrv,
          dta,
          iva,
          total,
        });
      }
    }
  }, [valorFactura, flete, tipoCambio, igi, prv, ivaPrv, dtaActual, ivaActual, totalActual, onImpuestosChange]);
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
        <Col md={4}>
          <Form.Group>
            <Form.Label>IVA (calculado)</Form.Label>
            <Form.Control value={`$${ivaActual.toFixed(2)} MXN`} disabled />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>PRV</Form.Label>
            <Form.Select name="prv" value={prv} onChange={handleChange}>
              <option>No aplica</option>
              <option>290 pesos mexicanos</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
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