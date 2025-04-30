import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const Pedimento = ({ onPedimentoChange, datos = {} }) => {
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

  // Precargar datos en modo edición
  useEffect(() => {
    if (datos && Object.keys(datos).length > 0) {
      setData({
        tipoCambio: datos.tipoCambio ?? datos.tipo_cambio ?? '',
        pesoBruto: datos.pesoBruto ?? datos.peso_bruto ?? '',
        valorAduana: datos.valorAduana ?? datos.valor_aduana ?? '',
        dta: datos.dta ?? '',
        ivaPrv: datos.ivaPrv ?? datos.iva_prv ?? '',
        igiIge: datos.igiIge ?? datos.igi_ige ?? '',
        prv: datos.prv ?? '',
        iva: datos.iva ?? '',
      });
      setTotal(parseFloat(datos.total ?? 0));
    }
  }, [datos]);

  const {
    tipoCambio,
    pesoBruto,
    valorAduana,
    dta,
    ivaPrv,
    igiIge,
    prv,
    iva,
  } = data;

  useEffect(() => {
    const suma =
      parseNumber(tipoCambio) +
      parseNumber(pesoBruto) +
      parseNumber(valorAduana) +
      parseNumber(dta) +
      parseNumber(ivaPrv) +
      parseNumber(igiIge) +
      parseNumber(prv) +
      parseNumber(iva);

    if (suma.toFixed(2) !== total.toFixed(2)) {
      setTotal(suma);
      if (onPedimentoChange) {
        onPedimentoChange({
          tipoCambio,
          pesoBruto,
          valorAduana,
          dta,
          ivaPrv,
          igiIge,
          prv,
          iva,
          total: suma,
        });
      }
    }
  }, [
    tipoCambio,
    pesoBruto,
    valorAduana,
    dta,
    ivaPrv,
    igiIge,
    prv,
    iva,
    total,
    onPedimentoChange,
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
      <h5 className="mb-3 subform-title">Pedimento</h5>

      <Row className="mb-3">
        <Col md={3}>
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
        <Col md={3}>
          <Form.Group>
            <Form.Label>Peso Bruto</Form.Label>
            <Form.Control
              type="number"
              name="pesoBruto"
              value={pesoBruto}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Valor Aduana</Form.Label>
            <Form.Control
              type="number"
              name="valorAduana"
              value={valorAduana}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>DTA</Form.Label>
            <Form.Control
              type="number"
              name="dta"
              value={dta}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>IVA-PRV</Form.Label>
            <Form.Control
              type="number"
              name="ivaPrv"
              value={ivaPrv}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>IGI-IGE</Form.Label>
            <Form.Control
              type="number"
              name="igiIge"
              value={igiIge}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>PRV</Form.Label>
            <Form.Control
              type="number"
              name="prv"
              value={prv}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>IVA</Form.Label>
            <Form.Control
              type="number"
              name="iva"
              value={iva}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
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