import React, { useState, useEffect, useRef } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const CargosTraslados = ({ onCargosChange, datos = {} }) => {
  const [cargos, setCargos] = useState({
    terrestre: '',
    aereo: '',
    custodia: '',
    total: 0,
  });

  const yaPrecargado = useRef(false);

  useEffect(() => {
    const tieneDatos = Object.keys(datos).length > 0;

    if (tieneDatos && !yaPrecargado.current) {
      yaPrecargado.current = true;

      const actualizado = {
        terrestre: datos.terrestre ?? '',
        aereo: datos.aereo ?? '',
        custodia: datos.custodia ?? '',
      };

      actualizado.total =
        parseFloat(actualizado.terrestre || 0) +
        parseFloat(actualizado.aereo || 0) +
        parseFloat(actualizado.custodia || 0);

      setCargos(actualizado);

      onCargosChange?.({
        terrestre: parseFloat(actualizado.terrestre || 0),
        aereo: parseFloat(actualizado.aereo || 0),
        custodia: parseFloat(actualizado.custodia || 0),
        total: actualizado.total,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const actualizados = { ...cargos, [name]: value };

    actualizados.total =
      parseFloat(actualizados.terrestre || 0) +
      parseFloat(actualizados.aereo || 0) +
      parseFloat(actualizados.custodia || 0);

    setCargos(actualizados);
    onCargosChange?.(actualizados);
  };

  const soloNumeros = (e) => {
    if (!/[0-9.]|Backspace|Tab|ArrowLeft|ArrowRight/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="container-subform">
      <h5 className="mb-3 subform-title">Cargos de Traslados</h5>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Flete Terrestre (USD)</Form.Label>
            <Form.Control
              type="number"
              name="terrestre"
              value={cargos.terrestre}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Flete Aéreo (USD)</Form.Label>
            <Form.Control
              type="number"
              name="aereo"
              value={cargos.aereo}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Custodia (USD)</Form.Label>
            <Form.Control
              type="number"
              name="custodia"
              value={cargos.custodia}
              onChange={handleChange}
              onKeyDown={soloNumeros}
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="text-end mt-3">
        <strong>Total Cargos: ${Number(cargos.total || 0).toFixed(2)} USD</strong>
      </div>
    </div>
  );
};

export default CargosTraslados;