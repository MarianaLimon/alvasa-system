import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';

const hoyLocalYYYYMMDD = () => {
  const d = new Date();
  // Ajuste a hora local para evitar desface por UTC
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
};

const ModalPago = ({ mostrar, onCerrar, numeroControl, saldo, onGuardar }) => {
  const [abono, setAbono] = useState('');
  const [fechaPago, setFechaPago] = useState('');
  const [tipoTransaccion, setTipoTransaccion] = useState('Transferencia');

  useEffect(() => {
    if (mostrar) {
      setAbono('');
      setFechaPago(hoyLocalYYYYMMDD());           // ← fecha de hoy por defecto
      setTipoTransaccion('Transferencia');
    }
  }, [mostrar, numeroControl]);

  const handleGuardar = async () => {
    if (!abono || !fechaPago || !tipoTransaccion) {
      return alert('Completa todos los campos');
    }
    if (parseFloat(abono) > parseFloat(saldo)) {
      return alert('El abono no puede ser mayor al saldo actual');
    }

    const nuevoPago = {
      numero_control: numeroControl,
      abono,
      fecha_pago: fechaPago,
      tipo_transaccion: tipoTransaccion
    };

    await onGuardar(nuevoPago);
  };

  return (
    <Modal show={mostrar} onHide={onCerrar} centered>
      <Modal.Header closeButton>
        <Modal.Title>Registrar pago para {numeroControl}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Saldo actual</Form.Label>
            <Form.Control value={`$${parseFloat(saldo).toFixed(2)}`} disabled />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Abono</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                step="any"
                value={abono}
                onChange={(e) => setAbono(e.target.value)}
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha del pago</Form.Label>
            <Form.Control
              type="date"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo de transacción</Form.Label>
            <Form.Select
              value={tipoTransaccion}
              onChange={(e) => setTipoTransaccion(e.target.value)}
            >
              <option value="Transferencia">Transferencia</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Cheque">Cheque</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
        <Button
          variant="success"
          onClick={handleGuardar}
          disabled={!abono || abono <= 0 || abono > saldo}
        >
          Guardar pago
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalPago;
