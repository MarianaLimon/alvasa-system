import React, { useEffect, useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const AADespacho = ({ datos = {}, onChange }) => {
  const [data, setData] = useState({
    aaDespacho: '',
    importacionCosto: '',
    importacionVenta: '',
    almacenajesCosto: '',
    almacenajesVenta: '',
    servicioCosto: '',
    servicioVenta: '',
    tipoServicio1: '',
    costoServicio1: '',
    ventaServicio1: '',
    tipoServicio2: '',
    costoServicio2: '',
    ventaServicio2: '',
  });

  useEffect(() => {
    const sinDatos =
      !data.importacionCosto && !data.importacionVenta &&
      !data.almacenajesCosto && !data.almacenajesVenta &&
      !data.servicioCosto && !data.servicioVenta &&
      !data.tipoServicio1 && !data.costoServicio1 && !data.ventaServicio1 &&
      !data.tipoServicio2 && !data.costoServicio2 && !data.ventaServicio2;

    if (sinDatos && datos && Object.keys(datos).length > 0) {
      setData({
        aaDespacho: datos.aaDespacho ?? '',
        importacionCosto: datos.importacionCosto ?? '',
        importacionVenta: datos.importacionVenta ?? '',
        almacenajesCosto: datos.almacenajesCosto ?? '',
        almacenajesVenta: datos.almacenajesVenta ?? '',
        servicioCosto: datos.servicioCosto ?? '',
        servicioVenta: datos.servicioVenta ?? '',
        tipoServicio1: datos.tipoServicio1 ?? '',
        costoServicio1: datos.costoServicio1 ?? '',
        ventaServicio1: datos.ventaServicio1 ?? '',
        tipoServicio2: datos.tipoServicio2 ?? '',
        costoServicio2: datos.costoServicio2 ?? '',
        ventaServicio2: datos.ventaServicio2 ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <Col md={6}>
          <Form.Group>
            <Form.Label>Nom. Proveedor</Form.Label>
            <Form.Control
              type="text"
              name="aaDespacho"
              value={data.aaDespacho}
              disabled
              className="text-uppercase"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-2">
        <Col md={2}><strong></strong></Col>
        <Col md={5}><strong>COSTO</strong></Col>
        <Col md={5}><strong>VENTA</strong></Col>
      </Row>

      <Row className="mb-2">
        <Col md={2}><Form.Label>Importación</Form.Label></Col>
        <Col md={5}>
          <Form.Control
            type="number"
            name="importacionCosto"
            value={data.importacionCosto}
            onChange={handleChange}
            onKeyDown={soloNumeros}
          />
        </Col>
        <Col md={5}>
          <Form.Control
            type="number"
            name="importacionVenta"
            value={data.importacionVenta}
            onChange={handleChange}
            onKeyDown={soloNumeros}
          />
        </Col>
      </Row>

      <Row className="mb-2">
        <Col md={2}><Form.Label>Almacenajes</Form.Label></Col>
        <Col md={5}>
          <Form.Control
            type="number"
            name="almacenajesCosto"
            value={data.almacenajesCosto}
            onChange={handleChange}
            onKeyDown={soloNumeros}
          />
        </Col>
        <Col md={5}>
          <Form.Control
            type="number"
            name="almacenajesVenta"
            value={data.almacenajesVenta}
            onChange={handleChange}
            onKeyDown={soloNumeros}
          />
        </Col>
      </Row>

      <Row className="mb-2">
        <Col md={2}><Form.Label>Serv. Prg. Mo Ejec.</Form.Label></Col>
        <Col md={5}>
          <Form.Control
            type="number"
            name="servicioCosto"
            value={data.servicioCosto}
            onChange={handleChange}
            onKeyDown={soloNumeros}
          />
        </Col>
        <Col md={5}>
          <Form.Control
            type="number"
            name="servicioVenta"
            value={data.servicioVenta}
            onChange={handleChange}
            onKeyDown={soloNumeros}
          />
        </Col>
      </Row>

      <hr className="my-4" />
      <h6 className="mb-3">Servicios adicionales</h6>

      {/* Servicio adicional 1 */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Servicio 1</Form.Label>
            <Form.Select
              name="tipoServicio1"
              value={data.tipoServicio1}
              onChange={handleChange}
              className="text-uppercase"
            >
              <option value="">Seleccione...</option>
              <option value="GRUPO ADUANAL">GRUPO ADUANAL</option>
              <option value="BAJA IMPORT">BAJA IMPORT</option>
              <option value="VANSAC">VANSAC</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Costo</Form.Label>
            <Form.Control
              type="number"
              name="costoServicio1"
              value={data.costoServicio1}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Venta</Form.Label>
            <Form.Control
              type="number"
              name="ventaServicio1"
              value={data.ventaServicio1}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Servicio adicional 2 */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Servicio 2</Form.Label>
            <Form.Select
              name="tipoServicio2"
              value={data.tipoServicio2}
              onChange={handleChange}
              className="text-uppercase"
            >
              <option value="">Seleccione...</option>
              <option value="INBOND">INBOND</option>
              <option value="APOYO CITA">APOYO CITA</option>
              <option value="UTILIDAD SERGIO">UTILIDAD SERGIO</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Costo</Form.Label>
            <Form.Control
              type="number"
              name="costoServicio2"
              value={data.costoServicio2}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Venta</Form.Label>
            <Form.Control
              type="number"
              name="ventaServicio2"
              value={data.ventaServicio2}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default AADespacho;