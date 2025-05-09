import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import FormularioCotizacion from './FormularioCotizacion';

const EditarCotizacion = () => {
  const { id } = useParams();
  const [datosIniciales, setDatosIniciales] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarCotizacion = async () => {
      try {
        const response = await axios.get(`http://localhost:5050/cotizaciones/${id}`);
        const cot = response.data;

        setDatosIniciales({
          form: {
            id: cot.id,
            folio: cot.folio,
            cliente_id: cot.cliente_id,
            empresa: cot.empresa,
            fecha: cot.fecha ? cot.fecha.split('T')[0] : '',
            mercancia: cot.mercancia,
            regimen: cot.regimen,
            aduana: cot.aduana,
            tipo_envio: cot.tipo_envio,
            cantidad: cot.cantidad,
            estatus: cot.estatus,
          },
          flete: {
            origenDestino: cot.flete_origen_destino,
            concepto1: cot.flete_concepto_1,
            valor1: cot.flete_valor_1,
            concepto2: cot.flete_concepto_2,
            valor2: cot.flete_valor_2,
            concepto3: cot.flete_concepto_3,
            valor3: cot.flete_valor_3,
            total: cot.flete_total,
          },
          cargos: cot.cargos?.[0] || {},
          cargosExtra: cot.cargos?.[0] || {},
          servicios: cot.servicios?.[0] || {},
          cuentaGastos: cot.cuentaGastos?.[0] || {},
          pedimento: cot.pedimento || {},
          impuestos: cot.desgloseImpuestos?.[0] || {},
          resumen: {
            propuesta: cot.propuesta,
            total: cot.total,
            ahorro: cot.ahorro,
            fraccion_igi: cot.fraccion_igi,
            monto_comisionista: cot.monto_comisionista,
            notas: cot.notas,
          }
        });

        setLoading(false);
      } catch (error) {
        console.error('Error cargando cotización para editar:', error);
        setLoading(false);
      }
    };

    cargarCotizacion();
  }, [id]);

  if (loading) return <div className="text-center mt-5">Cargando cotización para editar...</div>;

  return (
    <FormularioCotizacion modo="editar" datosIniciales={datosIniciales} />
  );
};

export default EditarCotizacion;