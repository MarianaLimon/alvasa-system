import { useEffect } from 'react';
import axios from 'axios';

export const useCargaInicialProceso = ({ modo, id, setForm, setClientes }) => {
  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const res = await axios.get('http://localhost:5050/clientes');
        setClientes(res.data);
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      }
    };

    const obtenerFolioProceso = async () => {
      try {
        const { data } = await axios.get('http://localhost:5050/procesos-operativos/siguiente-folio');
        setForm(prev => ({ ...prev, folioProceso: data.folio }));
      } catch (error) {
        console.error('Error al generar folio de proceso:', error);
      }
    };

    const obtenerDatosEdicion = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5050/procesos-operativos/${id}`);
        setForm({
          folioProceso: data.folio_proceso,
          clienteId: data.cliente_id,
          docPO: data.doc_po,
          mercancia: data.mercancia,
          fechaAlta: data.fecha_alta?.split('T')[0] || '',
          tipoImportacion: data.tipo_importacion,
          etd: data.etd?.split('T')[0] || '',
          cotizacionId: data.cotizacion_id,
          observaciones: data.observaciones
        });
      } catch (error) {
        console.error('Error al cargar proceso para edición:', error);
      }
    };

    obtenerClientes();

    if (modo === 'crear') {
      obtenerFolioProceso();
    } else if (modo === 'editar' && id) {
      obtenerDatosEdicion();
    }
  }, [modo, id, setForm, setClientes]);
};