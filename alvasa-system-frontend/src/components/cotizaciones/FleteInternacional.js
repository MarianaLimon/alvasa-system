import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const FleteInternacional = ({ onFleteChange, datos = {} }) => {
  const [flete, setFlete] = useState({
    origenDestino: datos.origenDestino || '',
    concepto1: datos.concepto1 || '',
    valor1: datos.valor1 || '',
    concepto2: datos.concepto2 || '',
    valor2: datos.valor2 || '',
    concepto3: datos.concepto3 || '',
    valor3: datos.valor3 || '',
    total: 0,
  });

  const parseNumber = (val) => parseFloat(val) || 0;

  // Precargar datos en modo edición
  useEffect(() => {
    const actualizado = {
      origenDestino: datos.origenDestino || '',
      concepto1: datos.concepto1 || '',
      valor1: datos.valor1 || '',
      concepto2: datos.concepto2 || '',
      valor2: datos.valor2 || '',
      concepto3: datos.concepto3 || '',
      valor3: datos.valor3 || '',
    };

    actualizado.total =
      (actualizado.concepto1 ? parseNumber(actualizado.valor1) : 0) +
      (actualizado.concepto2 ? parseNumber(actualizado.valor2) : 0) +
      (actualizado.concepto3 ? parseNumber(actualizado.valor3) : 0);

    setFlete(actualizado);
  }, [datos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const actualizado = { ...flete, [name]: value };

    // Si se borró el concepto, también reseteamos el valor
    if (name.startsWith('concepto') && value === '') {
      const valorKey = `valor${name.slice(-1)}`;
      actualizado[valorKey] = '';
    }

    actualizado.total =
      (actualizado.concepto1 ? parseNumber(actualizado.valor1) : 0) +
      (actualizado.concepto2 ? parseNumber(actualizado.valor2) : 0) +
      (actualizado.concepto3 ? parseNumber(actualizado.valor3) : 0);

    setFlete(actualizado);

    if (onFleteChange) {
      onFleteChange({
        ...actualizado,
        valor1: actualizado.concepto1 ? parseNumber(actualizado.valor1) : 0,
        valor2: actualizado.concepto2 ? parseNumber(actualizado.valor2) : 0,
        valor3: actualizado.concepto3 ? parseNumber(actualizado.valor3) : 0,
      });
    }
  };

  return (
    <div className="container-subform">
      <h5 className="mb-3 subform-title">Flete Internacional</h5>

      <Form.Group className="mb-3">
        <Form.Label>Origen - Destino</Form.Label>
        <Form.Select
          name="origenDestino"
          value={flete.origenDestino}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar destino...</option>
          <option>China - México</option>
          <option>Corea - Long Beach</option>
          <option>EU - México</option>
          <option>Haipong - Los Ángeles</option>
          <option>Bangladesh - México</option>
          <option>Vietnam - Los Ángeles</option>
        </Form.Select>
      </Form.Group>

      {[1, 2, 3].map((i) => (
        <Row className="mb-3" key={i}>
          <Col md={6}>
            <Form.Group>
              <Form.Label>{`Concepto ${i}`}</Form.Label>
              <Form.Select
                name={`concepto${i}`}
                value={flete[`concepto${i}`]}
                onChange={handleChange}
              >
                <option value="">Selecciona</option>
                {i === 1 && (
                  <>
                    <option value="40">40</option>
                    <option value="20">20</option>
                  </>
                )}
                {i === 2 && (
                  <>
                    <option value="Liberación">Liberación</option>
                    <option value="Cargos locales">Cargos locales</option>
                    <option value="40">40</option>
                  </>
                )}
                {i === 3 && (
                  <>
                    <option value="Liberación">Liberación</option>
                    <option value="Seguro (mercancia)">Seguro (mercancia)</option>
                    <option value="Cargos locales">Cargos locales</option>
                  </>
                )}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Monto (USD)</Form.Label>
              <Form.Control
                type="number"
                name={`valor${i}`}
                value={flete[`valor${i}`]}
                onChange={handleChange}
                disabled={!flete[`concepto${i}`]}
              />
            </Form.Group>
          </Col>
        </Row>
      ))}

      <div className="text-end mt-3">
        <strong>Total Flete: ${Number(flete.total).toFixed(2)} USD</strong>
      </div>
    </div>
  );
};

export default FleteInternacional;