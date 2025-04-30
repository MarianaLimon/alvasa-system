import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const Servicios = ({ onServiciosChange, datos = {} }) => {
  const [data, setData] = useState({
    maniobras: '',
    revalidacion: '',
    gestionDestino: '',
    inspeccionPeritaje: '',
    documentacionImportacion: '',
    garantiaContenedores: '',
    distribucion: '',
    serentyPremium: '',
  });

  const [total, setTotal] = useState(0);

  const parseNumber = (val) => parseFloat(val) || 0;

  // Precargar datos en modo edición
  useEffect(() => {
    if (datos && Object.keys(datos).length > 0) {
      setData({
        maniobras: datos.maniobras ?? '',
        revalidacion: datos.revalidacion ?? '',
        gestionDestino: datos.gestionDestino ?? datos.gestion_destino ?? '',
        inspeccionPeritaje: datos.inspeccionPeritaje ?? datos.inspeccion_peritaje ?? '',
        documentacionImportacion: datos.documentacionImportacion ?? datos.documentacion_importacion ?? '',
        garantiaContenedores: datos.garantiaContenedores ?? datos.garantia_contenedores ?? '',
        distribucion: datos.distribucion ?? '',
        serentyPremium: datos.serentyPremium ?? datos.serenty_premium ?? '',
      });
      setTotal(parseFloat(datos.total ?? 0));
    }
  }, [datos]);

  const {
    maniobras,
    revalidacion,
    gestionDestino,
    inspeccionPeritaje,
    documentacionImportacion,
    garantiaContenedores,
    distribucion,
    serentyPremium,
  } = data;

  useEffect(() => {
    const suma = [
      parseNumber(maniobras),
      parseNumber(revalidacion),
      parseNumber(gestionDestino),
      parseNumber(inspeccionPeritaje),
      parseNumber(documentacionImportacion),
      parseNumber(garantiaContenedores),
      parseNumber(distribucion),
      parseNumber(serentyPremium),
    ].reduce((acc, val) => acc + val, 0);

    if (suma.toFixed(2) !== total.toFixed(2)) {
      setTotal(suma);
      if (onServiciosChange) {
        onServiciosChange({
          maniobras,
          revalidacion,
          gestionDestino,
          inspeccionPeritaje,
          documentacionImportacion,
          garantiaContenedores,
          distribucion,
          serentyPremium,
          total: suma,
        });
      }
    }
  }, [
    maniobras,
    revalidacion,
    gestionDestino,
    inspeccionPeritaje,
    documentacionImportacion,
    garantiaContenedores,
    distribucion,
    serentyPremium,
    total,
    onServiciosChange,
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
      <h5 className="mb-3 subform-title">Servicios</h5>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Maniobras</Form.Label>
            <Form.Control
              type="number"
              name="maniobras"
              value={maniobras}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Revalidación</Form.Label>
            <Form.Control
              type="number"
              name="revalidacion"
              value={revalidacion}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Gestión Contenedores Destino</Form.Label>
            <Form.Control
              type="number"
              name="gestionDestino"
              value={gestionDestino}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>T. Inspección y Peritaje Contenedores</Form.Label>
            <Form.Control
              type="number"
              name="inspeccionPeritaje"
              value={inspeccionPeritaje}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>T. Documentación de Importación</Form.Label>
            <Form.Control
              type="number"
              name="documentacionImportacion"
              value={documentacionImportacion}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Garantía de Contenedores</Form.Label>
            <Form.Control
              type="number"
              name="garantiaContenedores"
              value={garantiaContenedores}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>T. Distribución</Form.Label>
            <Form.Control
              type="number"
              name="distribucion"
              value={distribucion}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Serenty PREMIUM</Form.Label>
            <Form.Control
              type="number"
              name="serentyPremium"
              value={serentyPremium}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex align-items-end justify-content-end total-servicios">
          <strong>Total Servicios: ${total.toFixed(2)} USD</strong>
        </Col>
      </Row>
    </div>
  );
};

export default Servicios;