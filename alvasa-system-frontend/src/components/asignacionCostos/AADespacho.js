import React, { useEffect, useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const AADespacho = ({ datos = {}, onChange, costoDespachoCot = '', propuestaCot = '' }) => {
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
  console.log('📦 datos:', datos);
  console.log('💰 costoDespachoCot:', costoDespachoCot);
  console.log('📈 propuestaCot:', propuestaCot);
}, [datos, costoDespachoCot, propuestaCot]);

useEffect(() => {
  let nuevosDatos = {};

  if (datos && Object.keys(datos).length > 0) {
    nuevosDatos = { ...datos };
  }

  if (costoDespachoCot) {
    nuevosDatos.importacionCosto = costoDespachoCot;
  }

  if (propuestaCot) {
    nuevosDatos.importacionVenta = propuestaCot;
  }

  if (Object.keys(nuevosDatos).length > 0) {
    setData(prev => {
      const actualizado = { ...prev, ...nuevosDatos };
      if (onChange) onChange(actualizado);
      return actualizado;
    });
  }    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [JSON.stringify(datos), costoDespachoCot, propuestaCot]);

    



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
            disabled
            readOnly
          />
        </Col>
        <Col md={5}>
          <Form.Control
            type="number"
            name="importacionVenta"
            value={data.importacionVenta}
            disabled
            readOnly
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
