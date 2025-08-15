import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';


const ModalAbonoEstadoCuenta = ({ show, handleClose, idEstadoCuenta, saldoActual = 0, onAbonoExitoso }) => {
  const [abono, setAbono] = useState('');
  const [fechaPago, setFechaPago] = useState('');
  const [tipoTransaccion, setTipoTransaccion] = useState('Efectivo');

  // Reset de campos cada vez que se abre el modal
  useEffect(() => {
    setAbono('');
    setFechaPago('');
    setTipoTransaccion('Efectivo');
  }, [show, idEstadoCuenta]);

  const handleGuardar = async () => {
  if (!abono || !fechaPago || !tipoTransaccion) {
    toast.error('Completa todos los campos');
    return;
  }

  if (parseFloat(abono) > parseFloat(saldoActual)) {
    toast.error('El abono no puede ser mayor al saldo actual');
    return;
  }

  try {
    // 🔁 Solo llamas al padre
    if (onAbonoExitoso) {
      await onAbonoExitoso({
        id_estado_cuenta: idEstadoCuenta,
        abono,
        fecha_pago: fechaPago,
        tipo_transaccion: tipoTransaccion
      });
    }

    toast.success('✅ Abono registrado correctamente.');
    handleClose();
  } catch (error) {
    console.error('❌ Error al guardar abono:', error);
    toast.error(error.response?.data?.mensaje || 'Ocurrió un error al guardar el abono.');
  }
};



  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Registrar abono para {idEstadoCuenta}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Saldo actual</Form.Label>
            <Form.Control
              value={`$${parseFloat(saldoActual).toFixed(2)}`}
              disabled
            />
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
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Cheque">Cheque</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
        <Button
          variant="success"
          onClick={handleGuardar}
          disabled={!abono || abono <= 0 || abono > saldoActual}
        >
          Guardar abono
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalAbonoEstadoCuenta;
