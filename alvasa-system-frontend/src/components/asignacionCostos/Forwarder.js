import React, { useEffect, useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const Forwarder = ({ datos = {}, onChange }) => {
  const [data, setData] = useState({
    forwarder: '',
    asignadoPor: '',
    consignatario: '',
    naviera: '',

    fleteInternacionalCosto: '',
    fleteInternacionalVenta: '',
    cargosLocalesCosto: '',
    cargosLocalesVenta: '',
    demorasCosto: '',
    demorasVenta: '',

    abonado: '',
    fechaAbon: '',
    rembolsado: '',
    fechaRemb: '',
  });

  useEffect(() => {
    const sinDatos =
      !data.fleteInternacionalCosto && !data.fleteInternacionalVenta &&
      !data.cargosLocalesCosto && !data.cargosLocalesVenta &&
      !data.demorasCosto && !data.demorasVenta &&
      !data.abonado && !data.fechaAbon && !data.rembolsado && !data.fechaRemb;

    if (sinDatos && datos && Object.keys(datos).length > 0) {
      setData({
        forwarder: datos.forwarder ?? '',
        asignadoPor: datos.asignadoPor ?? datos.asignado_por ?? '',
        consignatario: datos.consignatario ?? '',
        naviera: datos.naviera ?? '',

        fleteInternacionalCosto: datos.fleteInternacionalCosto ?? '',
        fleteInternacionalVenta: datos.fleteInternacionalVenta ?? '',
        cargosLocalesCosto: datos.cargosLocalesCosto ?? '',
        cargosLocalesVenta: datos.cargosLocalesVenta ?? '',
        demorasCosto: datos.demorasCosto ?? '',
        demorasVenta: datos.demorasVenta ?? '',

        abonado: datos.abonado ?? '',
        fechaAbon: datos.fechaAbon ?? '',
        rembolsado: datos.rembolsado ?? '',
        fechaRemb: datos.fechaRemb ?? '',
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
            <Form.Label>Nom. Forwarder</Form.Label>
            <Form.Control type="text" value={data.forwarder} disabled className="text-uppercase" />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Asignado por</Form.Label>
            <Form.Select name="asignadoPor" value={data.asignadoPor} onChange={handleChange} className="text-uppercase">
              <option value="">Seleccione...</option>
              <option value="TRADING SOLUTIONS">TRADING SOLUTIONS</option>
              <option value="WEPORT">WEPORT</option>
              <option value="MEXPROUD">MEXPROUD</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Consignatario</Form.Label>
            <Form.Control type="text" value={data.consignatario} disabled className="text-uppercase" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Naviera</Form.Label>
            <Form.Control type="text" value={data.naviera} disabled className="text-uppercase" />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-2">
        <Col md={2}></Col>
        <Col md={5}><strong>COSTO</strong></Col>
        <Col md={5}><strong>VENTA</strong></Col>
      </Row>

      <Row className="mb-2">
        <Col md={2}><Form.Label>Flete Internacional</Form.Label></Col>
        <Col md={5}>
          <Form.Control type="number" name="fleteInternacionalCosto" value={data.fleteInternacionalCosto} onChange={handleChange} onKeyDown={soloNumeros} />
        </Col>
        <Col md={5}>
          <Form.Control type="number" name="fleteInternacionalVenta" value={data.fleteInternacionalVenta} onChange={handleChange} onKeyDown={soloNumeros} />
        </Col>
      </Row>

      <Row className="mb-2">
        <Col md={2}><Form.Label>Cargos Locales</Form.Label></Col>
        <Col md={5}>
          <Form.Control type="number" name="cargosLocalesCosto" value={data.cargosLocalesCosto} onChange={handleChange} onKeyDown={soloNumeros} />
        </Col>
        <Col md={5}>
          <Form.Control type="number" name="cargosLocalesVenta" value={data.cargosLocalesVenta} onChange={handleChange} onKeyDown={soloNumeros} />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={2}><Form.Label>Demoras</Form.Label></Col>
        <Col md={5}>
          <Form.Control type="number" name="demorasCosto" value={data.demorasCosto} onChange={handleChange} onKeyDown={soloNumeros} />
        </Col>
        <Col md={5}>
          <Form.Control type="number" name="demorasVenta" value={data.demorasVenta} onChange={handleChange} onKeyDown={soloNumeros} />
        </Col>
      </Row>

      <hr className="my-4" />
      <h6 className="mb-3">Garantías</h6>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Label>Abonado</Form.Label>
          <Form.Control
            type="number"
            name="abonado"
            value={data.abonado}
            onChange={handleChange}
            onKeyDown={soloNumeros}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Fecha Abon</Form.Label>
          <Form.Control
            type="date"
            name="fechaAbon"
            value={data.fechaAbon}
            onChange={handleChange}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Rembolsado</Form.Label>
          <Form.Control
            type="number"
            name="rembolsado"
            value={data.rembolsado}
            onChange={handleChange}
            onKeyDown={soloNumeros}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Fecha Remb</Form.Label>
          <Form.Control
            type="date"
            name="fechaRemb"
            value={data.fechaRemb}
            onChange={handleChange}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Forwarder;