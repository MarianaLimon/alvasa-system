import React, { useEffect, useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const Custodia = ({ datos = {}, onChange }) => {
  const [data, setData] = useState({
    nombreProveedor: '',

    custodiaCosto: '', custodiaVenta: '',
    pernoctaCosto: '', pernoctaVenta: '',
    falsoCosto: '', falsoVenta: '',
    cancelacionCosto: '', cancelacionVenta: '',

    diasCosto: '', diasVenta: '',
    costoAlmacenaje: '', ventaAlmacenaje: '',
  });

  useEffect(() => {
    if (datos && Object.keys(datos).length > 0) {
      setData({
        nombreProveedor: datos.nombreProveedor ?? '',
        custodiaCosto: datos.custodiaCosto ?? '',
        custodiaVenta: datos.custodiaVenta ?? '',
        pernoctaCosto: datos.pernoctaCosto ?? '',
        pernoctaVenta: datos.pernoctaVenta ?? '',
        falsoCosto: datos.falsoCosto ?? '',
        falsoVenta: datos.falsoVenta ?? '',
        cancelacionCosto: datos.cancelacionCosto ?? '',
        cancelacionVenta: datos.cancelacionVenta ?? '',
        diasCosto: datos.diasCosto ?? '',
        diasVenta: datos.diasVenta ?? '',
        costoAlmacenaje: datos.costoAlmacenaje ?? '',
        ventaAlmacenaje: datos.ventaAlmacenaje ?? '',
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
              name="nombreProveedor"
              value={data.nombreProveedor}
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

      {["custodia", "pernocta", "falso", "cancelacion"].map((campo, i) => (
        <Row className="mb-2" key={i}>
          <Col md={4}>
            <Form.Label>{
              campo === "custodia" ? "Custodia" :
              campo === "pernocta" ? "Pernocta de Custodia" :
              campo === "falso" ? "Custodia en Falso" :
              "Cancelación de Custodia"
            }</Form.Label>
          </Col>
          <Col md={4}>
            <Form.Control
              type="number"
              name={`${campo}Costo`}
              value={data[`${campo}Costo`]}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Col>
          <Col md={4}>
            <Form.Control
              type="number"
              name={`${campo}Venta`}
              value={data[`${campo}Venta`]}
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
              name="diasCosto"
              value={data.diasCosto}
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
              name="costoAlmacenaje"
              value={data.costoAlmacenaje}
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
              name="diasVenta"
              value={data.diasVenta}
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
              name="ventaAlmacenaje"
              value={data.ventaAlmacenaje}
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
