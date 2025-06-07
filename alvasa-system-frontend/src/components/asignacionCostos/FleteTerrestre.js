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
    const {
      proveedor = '',
      flete = '', fleteVenta = '',
      estadia = '', estadiaVenta = '',
      burreo = '', burreoVenta = '',
      sobrepeso = '', sobrepesoVenta = '',
      apoyo = '', apoyoVenta = '',
      pernocta = '', pernoctaVenta = '',
      extras: extrasRecibidos = []
    } = datos;

    setData({
      proveedor,
      flete,
      fleteVenta,
      estadia,
      estadiaVenta,
      burreo,
      burreoVenta,
      sobrepeso,
      sobrepesoVenta,
      apoyo,
      apoyoVenta,
      pernocta,
      pernoctaVenta
    });

    setExtras(extrasRecibidos);
  }
}, [datos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevoData = { ...data, [name]: value };
    setData(nuevoData);
    if (onChange) onChange({ ...nuevoData, extras });
  };

  const handleExtraChange = (index, campo, valor) => {
    const nuevosExtras = [...extras];
    nuevosExtras[index][campo] = valor;
    setExtras(nuevosExtras);

    // Además de actualizar el array local, actualiza el estado principal (form)
    if (onChange) {
      const extrasToForm = {};
      nuevosExtras.forEach((extra, i) => {
        extrasToForm[`extra${i + 1}`] = extra.concepto;
        extrasToForm[`extra${i + 1}Costo`] = extra.costo;
        extrasToForm[`extra${i + 1}Venta`] = extra.venta;
      });
      onChange(extrasToForm);
    }
  };

  const agregarExtra = () => {
    if (extras.length < 6) {
      const nuevos = [...extras, { concepto: '', costo: '', venta: '' }];
      setExtras(nuevos);
      if (onChange) {
        const extrasToForm = { extras: nuevos };
        nuevos.forEach((extra, i) => {
          extrasToForm[`extra${i + 1}`] = extra.concepto;
          extrasToForm[`extra${i + 1}Costo`] = extra.costo;
          extrasToForm[`extra${i + 1}Venta`] = extra.venta;
        });
        onChange({ ...data, ...extrasToForm });
      }
    }
  };

  const eliminarExtra = (index) => {
    const nuevos = extras.filter((_, i) => i !== index);
    setExtras(nuevos);

    if (onChange) {
      const extrasToForm = { extras: nuevos };
      nuevos.forEach((extra, i) => {
        extrasToForm[`extra${i + 1}`] = extra.concepto;
        extrasToForm[`extra${i + 1}Costo`] = extra.costo;
        extrasToForm[`extra${i + 1}Venta`] = extra.venta;
      });

      // Borra los que ya no existen (ej. extra4...6 si ahora solo hay 3)
      for (let i = nuevos.length + 1; i <= 6; i++) {
        extrasToForm[`extra${i}`] = '';
        extrasToForm[`extra${i}Costo`] = '';
        extrasToForm[`extra${i}Venta`] = '';
      }

      onChange({ ...data, ...extrasToForm });
    }
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
