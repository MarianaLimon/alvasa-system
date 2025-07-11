import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const ModalMoneda = ({ show, onClose, numeroControl, onMonedaActualizada }) => {
  const [tipoMoneda, setTipoMoneda] = useState('MXN');
  const [tipoCambio, setTipoCambio] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && numeroControl) {
      // Obtener datos actuales si ya se guardó antes
      axios.get(`http://localhost:5050/pagos-proveedores/moneda/${numeroControl}`)
        .then(res => {
          const { tipo_moneda, tipo_cambio } = res.data;
          setTipoMoneda(tipo_moneda || 'MXN');
          setTipoCambio(tipo_cambio || '');
        })
        .catch(() => {
          setTipoMoneda('MXN');
          setTipoCambio('');
        });
    }
  }, [show, numeroControl]);

  const handleGuardar = async () => {
    setError('');

    if (!tipoMoneda || (tipoMoneda !== 'MXN' && (!tipoCambio || parseFloat(tipoCambio) <= 0))) {
      setError('Debes proporcionar un tipo de cambio válido si la moneda no es MXN.');
      return;
    }

    try {
      await axios.put(`http://localhost:5050/pagos-proveedores/moneda/${numeroControl}`, {
        tipoMoneda,
        tipoCambio
      });

      onMonedaActualizada(); // para recargar datos en la lista
      onClose();
    } catch (err) {
      console.error(err);
      setError('Error al guardar la moneda.');
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Actualizar tipo de moneda</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}

        <Form.Group className="mb-3">
          <Form.Label>Tipo de moneda</Form.Label>
          <Form.Select value={tipoMoneda} onChange={(e) => setTipoMoneda(e.target.value)}>
            <option value="MXN">MXN (Peso Mexicano)</option>
            <option value="USD">USD (Dólar)</option>
            <option value="EUR">EUR (Euro)</option>
          </Form.Select>
        </Form.Group>

        {tipoMoneda !== 'MXN' && (
          <Form.Group className="mb-3">
            <Form.Label>Tipo de cambio</Form.Label>
            <Form.Control
              type="number"
              value={tipoCambio}
              onChange={(e) => setTipoCambio(e.target.value)}
            />
          </Form.Group>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleGuardar}>Guardar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalMoneda;
