import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';

const hoyISO = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

const toMoney = (v) => (Number(v || 0)).toFixed(2);

const ModalAbonoEstadoCuenta = ({ show, handleClose, idEstadoCuenta, saldoActual = 0, onAbonoExitoso }) => {
  const [abono, setAbono] = useState('');            // string controlado del input
  const [fechaPago, setFechaPago] = useState('');    // YYYY-MM-DD
  const [tipoTransaccion, setTipoTransaccion] = useState('Transferencia');
  const [saving, setSaving] = useState(false);

  // Normaliza saldo a número
  const saldoNum = useMemo(() => Number(saldoActual || 0), [saldoActual]);
  const abonoNum = useMemo(() => Number(abono || 0), [abono]);

  // Reset de campos cada vez que se abre el modal o cambia el estado
  useEffect(() => {
    if (show) {
      setAbono('');
      setFechaPago(hoyISO()); // default hoy
      setTipoTransaccion('Transferencia');
      setSaving(false);
    }
  }, [show, idEstadoCuenta]);

  const handleGuardar = async () => {
    // Validaciones básicas
    if (!idEstadoCuenta) {
      toast.error('Falta el número de estado de cuenta.');
      return;
    }
    if (!abono || isNaN(abonoNum) || abonoNum <= 0) {
      toast.error('Ingresa un abono válido (mayor a 0).');
      return;
    }
    if (!fechaPago) {
      toast.error('Selecciona la fecha de pago.');
      return;
    }
    if (abonoNum > saldoNum) {
      toast.error('El abono no puede ser mayor al saldo actual.');
      return;
    }

    try {
      setSaving(true);

      // Redondeo a 2 decimales por seguridad
      const abonoRedondeado = Math.round(abonoNum * 100) / 100;

      if (onAbonoExitoso) {
        await onAbonoExitoso({
          id_estado_cuenta: idEstadoCuenta,   // ← código EC-000x
          abono: abonoRedondeado,             // ← número, no string
          fecha_pago: fechaPago,              // YYYY-MM-DD
          tipo_transaccion: tipoTransaccion
        });
      }

      toast.success('✅ Abono registrado correctamente.');
      handleClose();
    } catch (error) {
      console.error('❌ Error al guardar abono:', error);
      toast.error(error?.response?.data?.mensaje || 'Ocurrió un error al guardar el abono.');
    } finally {
      setSaving(false);
    }
  };

  // Permitir Enter para guardar
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!saving) handleGuardar();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered onKeyDown={onKeyDown}>
      <Modal.Header closeButton>
        <Modal.Title>Registrar abono para {idEstadoCuenta}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Saldo actual</Form.Label>
            <Form.Control value={`$${toMoney(saldoNum)}`} disabled />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Abono</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                inputMode="decimal"
                type="number"
                step="0.01"
                min="0"
                value={abono}
                onChange={(e) => setAbono(e.target.value)}
                placeholder="0.00"
              />
            </InputGroup>
            {abono && abonoNum > saldoNum && (
              <div className="text-danger small mt-1">
                El abono no puede ser mayor al saldo (${toMoney(saldoNum)}).
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha del pago</Form.Label>
            <Form.Control
              type="date"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-0">
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
        <Button variant="secondary" onClick={handleClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="success"
          onClick={handleGuardar}
          disabled={
            saving ||
            !abono ||
            isNaN(abonoNum) ||
            abonoNum <= 0 ||
            abonoNum > saldoNum ||
            !fechaPago
          }
        >
          {saving ? 'Guardando…' : 'Guardar abono'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalAbonoEstadoCuenta;
