import React, { useEffect, useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const Custodia = ({ datos = {}, onChange }) => {
  const [data, setData] = useState({
    custodiaProveedor: '',
    custodiaCosto: '', custodiaVenta: '',
    custodiaPernoctaCosto: '', custodiaPernoctaVenta: '',
    custodiaFalsoCosto: '', custodiaFalsoVenta: '',
    custodiaCancelacionCosto: '', custodiaCancelacionVenta: '',
    custodiaDiasCosto: '', custodiaDiasVenta: '',
    custodiaCostoAlmacenaje: '', custodiaVentaAlmacenaje: ''
  });

  useEffect(() => {
    if (datos && Object.keys(datos).length > 0) {
      setData({
        custodiaProveedor: datos.custodiaProveedor ?? '',
        custodiaCosto: datos.custodiaCosto ?? '',
        custodiaVenta: datos.custodiaVenta ?? '',
        custodiaPernoctaCosto: datos.custodiaPernoctaCosto ?? '',
        custodiaPernoctaVenta: datos.custodiaPernoctaVenta ?? '',
        custodiaFalsoCosto: datos.custodiaFalsoCosto ?? '',
        custodiaFalsoVenta: datos.custodiaFalsoVenta ?? '',
        custodiaCancelacionCosto: datos.custodiaCancelacionCosto ?? '',
        custodiaCancelacionVenta: datos.custodiaCancelacionVenta ?? '',
        custodiaDiasCosto: datos.custodiaDiasCosto ?? '',
        custodiaDiasVenta: datos.custodiaDiasVenta ?? '',
        custodiaCostoAlmacenaje: datos.custodiaCostoAlmacenaje ?? '',
        custodiaVentaAlmacenaje: datos.custodiaVentaAlmacenaje ?? ''
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
          <Form.Group>
            <Form.Label>Nombre Prov.</Form.Label>
            <Form.Select
              name="custodiaProveedor"
              value={data.custodiaProveedor}
              onChange={handleChange}
              className="text-uppercase"
            >
              <option value="">Seleccione...</option>
              <option value="SEBASTIAN">SEBASTIAN</option>
              <option value="RICARDO">RICARDO</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-2">
        <Col md={4}></Col>
        <Col md={4}><strong>COSTO</strong></Col>
        <Col md={4}><strong>VENTA</strong></Col>
      </Row>

      {[
        { label: 'Custodia', base: 'custodia' },
        { label: 'Pernocta de Custodia', base: 'custodiaPernocta' },
        { label: 'Custodia en Falso', base: 'custodiaFalso' },
        { label: 'Cancelación de Custodia', base: 'custodiaCancelacion' }
      ].map(({ label, base }, i) => (
        <Row className="mb-2" key={i}>
          <Col md={4}><Form.Label>{label}</Form.Label></Col>
          <Col md={4}>
            <Form.Control
              type="number"
              name={`${base}Costo`}
              value={data[`${base}Costo`]}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Col>
          <Col md={4}>
            <Form.Control
              type="number"
              name={`${base}Venta`}
              value={data[`${base}Venta`]}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Col>
        </Row>
      ))}

      <Row className="mt-4 align-items-end">
        <Col md={4}><Form.Label>Almacenaje</Form.Label></Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>DIAS</Form.Label>
            <Form.Control
              type="number"
              name="custodiaDiasCosto"
              value={data.custodiaDiasCosto}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>COSTO <span>MXN</span></Form.Label>
            <Form.Control
              type="number"
              name="custodiaCostoAlmacenaje"
              value={data.custodiaCostoAlmacenaje}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>DIAS</Form.Label>
            <Form.Control
              type="number"
              name="custodiaDiasVenta"
              value={data.custodiaDiasVenta}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>VENTA <span>MXN</span></Form.Label>
            <Form.Control
              type="number"
              name="custodiaVentaAlmacenaje"
              value={data.custodiaVentaAlmacenaje}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default Custodia;
