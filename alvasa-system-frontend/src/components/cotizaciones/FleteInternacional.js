import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const FleteInternacional = ({ onFleteChange, datos = {} }) => {
  const [flete, setFlete] = useState({
    origenDestino: '',
    concepto1: '',
    valor1: '',
    concepto2: '',
    valor2: '',
    concepto3: '',
    valor3: '',
    total: 0,
  });

  // Precargar datos si los recibe desde el padre
  useEffect(() => {
    if (datos && Object.keys(datos).length > 0) {
      const cargado = {
        ...datos,
        total:
          parseFloat(datos.valor1 || 0) +
          parseFloat(datos.valor2 || 0) +
          parseFloat(datos.valor3 || 0),
      };
      setFlete(cargado);
      if (onFleteChange) onFleteChange(cargado);
    }
  }, [datos, onFleteChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const actualizado = { ...flete, [name]: value };

    actualizado.total =
      parseFloat(actualizado.valor1 || 0) +
      parseFloat(actualizado.valor2 || 0) +
      parseFloat(actualizado.valor3 || 0);

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
                    <option value="Flete marino">Flete marino</option>
                    <option value="20DS">20DS</option>
                  </>
                )}
                {i === 2 && (
                  <>
                    <option value="Cargos locales">Cargos locales</option>
                    <option value="40HQ">40HQ</option>
                  </>
                )}
                {i === 3 && (
                  <>
                    <option value="Liberación">Liberación</option>
                    <option value="Seguro de mercancía">Seguro de mercancía</option>
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
                onKeyDown={soloNumeros}
              />
            </Form.Group>
          </Col>
        </Row>
      ))}

      <div className="text-end mt-3">
        <strong>Total Flete: ${Number(flete.total || 0).toFixed(2)} USD</strong>
      </div>
    </div>
  );
};

export default FleteInternacional;