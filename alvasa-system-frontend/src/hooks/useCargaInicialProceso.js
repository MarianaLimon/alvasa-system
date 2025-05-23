import { useEffect } from 'react';
import axios from 'axios';

export const useCargaInicialProceso = ({
  modo,
  id,
  setForm,
  setClientes,
  setEmbarque,
  setRevalidacion,
  setDatosPedimento,
  setSalidaContenedor
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

        setEmbarque({
          hbl: data.informacion_embarque?.hbl || '',
          noContenedor: data.informacion_embarque?.no_contenedor || '',
          shipper: data.informacion_embarque?.shipper || '',
          icoterm: data.informacion_embarque?.icoterm || '',
          consignatario: data.informacion_embarque?.consignatario || '',
          forwarde: data.informacion_embarque?.forwarde || '',
          tipo: data.informacion_embarque?.tipo || '',
          pesoBL: data.informacion_embarque?.peso_bl || '',
          pesoReal: data.informacion_embarque?.peso_real || '',
          vessel: data.informacion_embarque?.vessel || '',
          naviera: data.informacion_embarque?.naviera || '',
          pol: data.informacion_embarque?.pol || '',
          paisOrigen: data.informacion_embarque?.pais_origen || '',
          pod: data.informacion_embarque?.pod || '',
          paisDestino: data.informacion_embarque?.pais_destino || ''
        });
        
        setRevalidacion({
          mbl: data.proceso_revalidacion?.mbl || '',
          eta: data.proceso_revalidacion?.eta?.split('T')[0] || '',
          descarga: data.proceso_revalidacion?.descarga?.split('T')[0] || '',
          terminal: data.proceso_revalidacion?.terminal || '',
          revalidacion: data.proceso_revalidacion?.revalidacion?.split('T')[0] || '',
          recepcionEnvioDocs: data.proceso_revalidacion?.recepcion_envio_docs?.split('T')[0] || ''
        });

        setDatosPedimento({
          pedimento: data.datos_pedimento?.pedimento || '',
          pagoPedimento: data.datos_pedimento?.pago_pedimento || '',
          regimen: data.datos_pedimento?.regimen || '',
          aaDespacho: data.datos_pedimento?.aa_despacho || '',
          agenteAduanal: data.datos_pedimento?.agente_aduanal || ''
        });

        setSalidaContenedor({
          salidaAduana: data.salida_retorno_contenedor?.salida_aduana || '',
          entrega: data.salida_retorno_contenedor?.entrega || '',
          fMax: data.salida_retorno_contenedor?.f_max || '',
          entregaVacio: data.salida_retorno_contenedor?.entrega_vacio || '',
          condicionesContenedor: data.salida_retorno_contenedor?.condiciones_contenedor || '',
          terminalVacio: data.salida_retorno_contenedor?.terminal_vacio || ''
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
  }, [
    modo,
    id,
    setForm,
    setClientes,
    setEmbarque,
    setRevalidacion,
    setDatosPedimento,
    setSalidaContenedor
  ]);
};