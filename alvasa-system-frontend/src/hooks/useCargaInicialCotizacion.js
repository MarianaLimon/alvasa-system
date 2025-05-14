import { useEffect } from 'react';
import axios from 'axios';

export const useCargaInicialCotizacion = ({
  modo,
  id,
  setForm,
  setClientes,
  setFlete,
  setCargos,
  setCargosExtra,
  setServicios,
  setCuentaGastos,
  setPedimento,
  setImpuestos
}) => {
  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const res = await axios.get('http://localhost:5050/clientes');
        setClientes(res.data);
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      }
    };
    obtenerClientes();
  }, [setClientes]);

  useEffect(() => {
    const obtenerUltimoFolio = async () => {
      try {
        const res = await axios.get('http://localhost:5050/cotizaciones');
        const cotizaciones = res.data;
        const nuevoFolio = cotizaciones.length > 0
          ? `COT-${(Math.max(...cotizaciones.map(c => parseInt(c.folio?.split('-')[1] || '0'))) + 1).toString().padStart(4, '0')}`
          : 'COT-0001';

        setForm(prev => ({ ...prev, folio: nuevoFolio }));
      } catch (error) {
        console.error('Error al generar folio:', error);
      }
    };

    const obtenerDatosEdicion = async () => {
      try {
        const { data: cot } = await axios.get(`http://localhost:5050/cotizaciones/${id}`);

        setForm({
          id: cot.id,
          folio: cot.folio,
          cliente_id: cot.cliente_id,
          empresa: cot.empresa,
          fecha: cot.fecha.split('T')[0],
          mercancia: cot.mercancia,
          regimen: cot.regimen,
          aduana: cot.aduana,
          tipo_envio: cot.tipo_envio,
          cantidad: cot.cantidad,
          estatus: cot.estatus,
          propuesta: cot.propuesta || '',
          total: cot.total || 0,
          ahorro: cot.ahorro || 0,
          fraccion_igi: cot.fraccion_igi || '',
          monto_comisionista: cot.monto_comisionista || '',
          notas: cot.notas || ''
        });

        setFlete({
          origenDestino: cot.flete_origen_destino,
          concepto1: cot.flete_concepto_1,
          valor1: cot.flete_valor_1,
          concepto2: cot.flete_concepto_2,
          valor2: cot.flete_valor_2,
          concepto3: cot.flete_concepto_3,
          valor3: cot.flete_valor_3,
          total: parseFloat(cot.flete_valor_1 || 0) + parseFloat(cot.flete_valor_2 || 0) + parseFloat(cot.flete_valor_3 || 0),
        });

        setCargos(cot.cargos?.[0] || {});
        setCargosExtra(cot.cargos?.[0] || {});
        setServicios(cot.servicios?.[0] || {});
        setCuentaGastos(cot.cuentaGastos?.[0] || {});
        setPedimento(cot.pedimento || {});

        const imp = cot.desgloseImpuestos?.[0] || {};
        setImpuestos({
          valorFactura: imp.valor_factura ?? '',
          flete: imp.flete ?? '',
          tipoCambio: imp.tipo_cambio ?? '',
          valorAduana: imp.valor_aduana ?? 0,
          dta: imp.dta ?? 0,
          igi: imp.igi ?? '',
          iva: imp.iva ?? 0,
          prv: imp.prv ?? 'No aplica',
          ivaPrv: imp.iva_prv ?? 'No aplica',
          total: imp.total ?? 0
        });
      } catch (error) {
        console.error('Error al cargar cotización:', error);
      }
    };

    if (modo === 'crear') {
      obtenerUltimoFolio();
    } else if (modo === 'editar' && id) {
      obtenerDatosEdicion();
    }
  }, [modo, id, setForm, setFlete, setCargos, setCargosExtra, setServicios, setCuentaGastos, setPedimento, setImpuestos]);
};