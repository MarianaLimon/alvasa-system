import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const Despacho = ({ datos = {}, onChange }) => {
  const [form, setForm] = useState({
    facturacion: '',
    comisionSocio: '',
    propuestaCosto: '',
    cotizacionFolio: '',
    propuestaCotizacion: '',
    comisionIntermediario: '',
  });

  const [foliosCotizaciones, setFoliosCotizaciones] = useState([]);

  useEffect(() => {
    // Precarga si hay datos
    if (datos && Object.keys(datos).length > 0) {
      setForm(prev => ({ ...prev, ...datos }));
    }

    // Cargar folios de cotizaciones
    axios.get('http://localhost:5050/cotizaciones')
      .then(res => {
        setFoliosCotizaciones(res.data);
      })
      .catch(err => console.error('Error al cargar cotizaciones:', err));
  }, [datos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevoForm = { ...form, [name]: value };
    setForm(nuevoForm);
    if (onChange) onChange(nuevoForm);
  };

  const handleSeleccionCotizacion = async (e) => {
    const folio = e.target.value;
    const nuevoForm = { ...form, cotizacionFolio: folio };

    try {
      const res = await axios.get(`http://localhost:5050/cotizaciones/folio/${folio}`);
      const cotizacion = res.data;
      nuevoForm.propuestaCotizacion = cotizacion.propuesta ?? '';
      nuevoForm.comisionIntermediario = cotizacion.comision_intermediario ?? '';
    } catch (err) {
      console.error('Error al obtener cotización:', err);
    }

    setForm(nuevoForm);
    if (onChange) onChange(nuevoForm);
  };

  return (
    <div className="container-subform">
      <h5 className="mb-3">Despacho</h5>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Facturación</Form.Label>
            <Form.Control
              type="number"
              name="facturacion"
              value={form.facturacion}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Comisión socio</Form.Label>
            <Form.Control
              type="number"
              name="comisionSocio"
              value={form.comisionSocio}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Propuesta-costo</Form.Label>
            <Form.Control
              type="number"
              name="propuestaCosto"
              value={form.propuestaCosto}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <h6 className="mt-4 mb-3">Datos de Cotización</h6>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Seleccionar folio de cotización</Form.Label>
            <Form.Select
              name="cotizacionFolio"
              value={form.cotizacionFolio}
              onChange={handleSeleccionCotizacion}
            >
              <option value="">Seleccione una cotización...</option>
              {foliosCotizaciones.map(c => (
                <option key={c.folio} value={c.folio}>{c.folio}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Propuesta</Form.Label>
            <Form.Control
              type="number"
              value={form.propuestaCotizacion}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Comisión Intermediario</Form.Label>
            <Form.Control
              type="number"
              value={form.comisionIntermediario}
              readOnly
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default Despacho;