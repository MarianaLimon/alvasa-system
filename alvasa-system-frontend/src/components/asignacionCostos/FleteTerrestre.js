import React, { useEffect, useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { BsTrash, BsPlusCircle } from 'react-icons/bs';

const FleteTerrestre = ({ datos = {}, onChange }) => {
  const [data, setData] = useState({
    proveedor: '',
    flete: '', fleteVenta: '',
    estadia: '', estadiaVenta: '',
    burreo: '', burreoVenta: '',
    sobrepeso: '', sobrepesoVenta: '',
    apoyo: '', apoyoVenta: '',
    pernocta: '', pernoctaVenta: ''
  });

  const [extras, setExtras] = useState([]);

  const opcionesExtras = [
    'FLETE TERRESTRE EN FALSO',
    'BURREO VACIO',
    'TRASPALEO',
    'CANCELACION DE UNIDAD',
    'ARRASTRE',
    'BURREO EXTRA'
  ];

  useEffect(() => {
    if (datos && Object.keys(datos).length > 0) {
      setData(prev => ({ ...prev, ...datos }));
    }
  }, [datos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevoData = { ...data, [name]: value };
    setData(nuevoData);
    if (onChange) onChange({ ...nuevoData, extras });
  };

  const handleExtraChange = (index, field, value) => {
    const nuevos = [...extras];
    nuevos[index] = { ...nuevos[index], [field]: value };
    setExtras(nuevos);
    if (onChange) onChange({ ...data, extras: nuevos });
  };

  const agregarExtra = () => {
    if (extras.length < 6) {
      setExtras([...extras, { concepto: '', costo: '', venta: '' }]);
    }
  };

  const eliminarExtra = (index) => {
    const nuevos = extras.filter((_, i) => i !== index);
    setExtras(nuevos);
    if (onChange) onChange({ ...data, extras: nuevos });
  };

  const soloNumeros = (e) => {
    if (!/[0-9.]|Backspace|Tab|ArrowLeft|ArrowRight/.test(e.key)) {
      e.preventDefault();
    }
  };

  const renderCampo = (label, campoBase) => (
    <Row className="mb-2">
      <Col md={4}>
        <Form.Label>{label}</Form.Label>
      </Col>
      <Col md={4}>
        <Form.Control
          type="number"
          name={campoBase}
          value={data[campoBase] || ''}
          onChange={handleChange}
          onKeyDown={soloNumeros}
        />
      </Col>
      <Col md={4}>
        <Form.Control
          type="number"
          name={`${campoBase}Venta`}
          value={data[`${campoBase}Venta`] || ''}
          onChange={handleChange}
          onKeyDown={soloNumeros}
        />
      </Col>
    </Row>
  );

  return (
    <div className="container-subform">
      <h5 className="mb-3 subform-title">Flete Terrestre</h5>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Label>Nombre Prov.</Form.Label>
          <Form.Select name="proveedor" value={data.proveedor} onChange={handleChange} className="text-uppercase">
            <option value="">Seleccione...</option>
            <option value="PABLO">PABLO</option>
            <option value="DIEGO">DIEGO</option>
            <option value="MARQUITO">MARQUITO</option>
            <option value="ORLANDO">ORLANDO</option>
          </Form.Select>
        </Col>
      </Row>

      <Row className="mb-2">
        <Col md={4}></Col>
        <Col md={4}><strong>COSTO MXN</strong></Col>
        <Col md={4}><strong>VENTA MXN</strong></Col>
      </Row>

      {renderCampo('Flete Terrestre', 'flete')}
      {renderCampo('Estadía Flete', 'estadia')}
      {renderCampo('Burreo', 'burreo')}
      {renderCampo('Sobrepeso', 'sobrepeso')}
      {renderCampo('Apoyo en Carga', 'apoyo')}
      {renderCampo('Pernocta de Apoyo en Carga', 'pernocta')}

      <hr />
      <h6 className="mb-3">Extras</h6>

      {extras.length > 0 && (
        <Row className="mb-2">
          <Col md={4}></Col>
          <Col md={3}><strong>COSTO MXN</strong></Col>
          <Col md={3}><strong>VENTA MXN</strong></Col>
        </Row>
      )}

      {extras.map((extra, index) => (
        <Row className="mb-2" key={index}>
          <Col md={4}>
            <Form.Select
              value={extra.concepto}
              onChange={(e) => handleExtraChange(index, 'concepto', e.target.value)}
              className="text-uppercase"
            >
              <option value="">Seleccione...</option>
              {opcionesExtras.map((op, i) => (
                <option key={i} value={op}>{op}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Control
              type="number"
              value={extra.costo}
              onChange={(e) => handleExtraChange(index, 'costo', e.target.value)}
              onKeyDown={soloNumeros}
            />
          </Col>
          <Col md={3}>
            <Form.Control
              type="number"
              value={extra.venta}
              onChange={(e) => handleExtraChange(index, 'venta', e.target.value)}
              onKeyDown={soloNumeros}
            />
          </Col>
          <Col md={2}>
            <Button variant="danger" onClick={() => eliminarExtra(index)}><BsTrash /></Button>
          </Col>
        </Row>
      ))}

      <Button variant="secondary" onClick={agregarExtra} className="mt-3" disabled={extras.length >= 6}>
        <BsPlusCircle className="me-2" />Agregar Campo
      </Button>
    </div>
  );
};

export default FleteTerrestre;
