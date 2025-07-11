import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';

const ModalPago = ({ mostrar, onCerrar, numeroControl, saldo, onGuardar }) => {
  const [abono, setAbono] = useState('');
  const [fechaPago, setFechaPago] = useState('');
  const [tipoTransaccion, setTipoTransaccion] = useState('Efectivo');
  const [saldoRestante, setSaldoRestante] = useState(saldo);

  useEffect(() => {
    // Resetear valores cuando cambia el número de control o se abre el modal
    setAbono('');
    setFechaPago('');
    setTipoTransaccion('Efectivo');
    setSaldoRestante(saldo);
  }, [mostrar, numeroControl, saldo]);

  const handleAbonoChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setAbono(value);

    const nuevoSaldo = saldo - value;
    setSaldoRestante(nuevoSaldo >= 0 ? nuevoSaldo.toFixed(2) : '0.00');
  };


  const handleGuardar = async () => {
    if (!abono || !fechaPago || !tipoTransaccion) return alert('Completa todos los campos');

    if (parseFloat(abono) > parseFloat(saldo)) {
        return alert('El abono no puede ser mayor al saldo actual');
    }

    const nuevoPago = {
        numero_control: numeroControl,
        abono,
        fecha_pago: fechaPago,
        tipo_transaccion: tipoTransaccion,
        saldo_restante: saldoRestante
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
            <Form.Control value={`$${saldo}`} disabled />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Abono</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                step="any"
                value={abono}
                onChange={handleAbonoChange}
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
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Cheque">Cheque</option>
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Saldo restante</Form.Label>
            <Form.Control value={`$${saldoRestante}`} disabled />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
        <Button variant="success" onClick={handleGuardar} disabled={!abono || abono <= 0 || abono > saldo} >
          Guardar pago
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalPago;