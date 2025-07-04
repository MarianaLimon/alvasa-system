import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const Despacho = ({ datos = {}, onChange }) => {
  const [form, setForm] = useState({
    facturacion: '',
    comisionSocio: '',
    cotizacionFolio: '',
    comisionIntermediario: '',
    // 👇 necesarios para AADespacho aunque no se muestran
    propuestaCotizacion: '',
    costo_despacho: ''
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

      // Estos datos son necesarios aunque no se vean
      nuevoForm.propuestaCotizacion = cotizacion.propuesta ?? '';
      nuevoForm.costo_despacho = cotizacion.costo_despacho ?? '';
      nuevoForm.comisionIntermediario = cotizacion.monto_comisionista ?? '';
    } catch (err) {
      console.error('Error al obtener cotización:', err);
    }

    setForm(nuevoForm);
    if (onChange) onChange(nuevoForm);
  };

  return (
    <div className="container-subform">
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
        <Col md={6}>
          <Form.Group>
            <Form.Label>Comisión Intermediario</Form.Label>
            <Form.Control
              type="number"
              value={form.comisionIntermediario}
              disabled
              readOnly
              className="bg-light"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
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
        <Col md={6}>
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
      </Row>
    </div>
  );
};

export default Despacho;
