import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const FleteInternacional = ({ onFleteChange }) => {
  const [flete, setFlete] = useState({
    origenDestino: 'China - México',
    opcion1: '',
    monto1: '',
    opcion2: '',
    monto2: '',
    opcion3: '',
    monto3: '',
    total: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const actualizado = { ...flete, [name]: value };
    actualizado.total =
      parseFloat(actualizado.monto1 || 0) +
      parseFloat(actualizado.monto2 || 0) +
      parseFloat(actualizado.monto3 || 0);
    setFlete(actualizado);
    if (onFleteChange) onFleteChange(actualizado);
  };

  const soloNumeros = (e) => {
    if (!/[0-9.]|Backspace|Tab|ArrowLeft|ArrowRight/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="container-subform">
      <h5 className="mb-3 subform-title">Flete Internacional</h5>

      <Form.Group className="mb-3">
        <Form.Label>Origen - Destino</Form.Label>
        <Form.Select name="origenDestino" value={flete.origenDestino} onChange={handleChange}>
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
              <Form.Label>{`Opción ${i}`}</Form.Label>
              <Form.Select name={`opcion${i}`} value={flete[`opcion${i}`]} onChange={handleChange}>
                {i === 1 && (
                  <>
                    <option value="">Selecciona</option>
                    <option>Flete marino</option>
                    <option>20DS</option>
                  </>
                )}
                {i === 2 && (
                  <>
                    <option value="">Selecciona</option>
                    <option>Cargos locales</option>
                    <option>40HQ</option>
                  </>
                )}
                {i === 3 && (
                  <>
                    <option value="">Selecciona</option>
                    <option>Liberación</option>
                    <option>Seguro de mercancía</option>
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
                name={`monto${i}`}
                value={flete[`monto${i}`]}
                onChange={handleChange}
                onKeyDown={soloNumeros}
              />
            </Form.Group>
          </Col>
        </Row>
      ))}

      <div className="text-end mt-3">
        <strong>Total Flete: ${flete.total.toFixed(2)} USD</strong>
      </div>
    </div>
  );
};

export default FleteInternacional;
