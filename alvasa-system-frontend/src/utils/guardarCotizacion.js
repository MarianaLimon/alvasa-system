import axios from 'axios';

export const guardarCotizacion = async ({
  modo,
  form,
  resumen,
  flete,
  cargos,
  cargosExtra,
  servicios,
  cuentaGastos,
  pedimento,
  impuestos,
  id,
}) => {
  const cotizacionCompleta = {
    ...form,
    propuesta: resumen.propuesta,
    costo_despacho: resumen.costo_despacho,
    total: resumen.total,
    ahorro: resumen.ahorro,
    fraccion_igi: resumen.fraccion_igi,
    monto_comisionista: resumen.monto_comisionista || 0,
    notas: resumen.notas,
    flete_origen_destino: flete.origenDestino,
    flete_concepto_1: flete.concepto1,
    flete_valor_1: flete.valor1,
    flete_concepto_2: flete.concepto2,
    flete_valor_2: flete.valor2,
    flete_concepto_3: flete.concepto3,
    flete_valor_3: flete.valor3,
    flete_seguro_mercancia: flete.seguroMercancia ? 1 : 0,
    flete_total: flete.total,
  };

  let idCotizacion = form.id || id;

  if (modo === 'crear') {
    const res = await axios.post('http://localhost:5050/cotizaciones', cotizacionCompleta);
    idCotizacion = res.data.id;

    await registrarSubformularios({ idCotizacion, cargos, cargosExtra, servicios, cuentaGastos, pedimento, impuestos });
  } else {
    await axios.put(`http://localhost:5050/cotizaciones/${id}`, cotizacionCompleta);

    await actualizarSubformularios({ idCotizacion, cargos, cargosExtra, servicios, cuentaGastos, pedimento, impuestos });
  }

  return { idCotizacion, cotizacionCompleta };
};

const registrarSubformularios = async ({ idCotizacion, cargos, cargosExtra, servicios, cuentaGastos, pedimento, impuestos }) => {
  const totalCargosCalculado = parseFloat(cargos.terrestre || 0) + parseFloat(cargos.aereo || 0) + parseFloat(cargos.custodia || 0);

  await axios.post('http://localhost:5050/cargos', {
    cotizacion_id: idCotizacion,
    terrestre: cargos.terrestre || 0,
    aereo: cargos.aereo || 0,
    custodia: cargos.custodia || 0,
    total_cargos: cargos.total || 0,
    almacenajes: totalCargosCalculado,
    demoras: cargosExtra.demoras || 0,
    pernocta: cargosExtra.pernocta || 0,
    burreo: cargosExtra.burreo || 0,
    flete_falso: cargosExtra.fleteFalso || 0,
    servicio_no_realizado: cargosExtra.servicioNoRealizado || 0,
    seguro: cargosExtra.seguro || 0,
    total_cargos_extra: cargosExtra.total || 0
  });

  await axios.post('http://localhost:5050/servicios', {
    cotizacion_id: idCotizacion,
    maniobras: servicios.maniobras || 0,
    revalidacion: servicios.revalidacion || 0,
    gestionDestino: servicios.gestionDestino || 0,
    inspeccionPeritaje: servicios.inspeccionPeritaje || 0,
    documentacionImportacion: servicios.documentacionImportacion || 0,
    garantiaContenedores: servicios.garantiaContenedores || 0,
    distribucion: servicios.distribucion || 0,
    serentyPremium: servicios.serentyPremium || 0,
    total: servicios.total || 0
  });

  await axios.post('http://localhost:5050/cuenta-gastos', {
    cotizacion_id: idCotizacion,
    honorarios: cuentaGastos.honorarios || 0,
    padron: cuentaGastos.padron || 0,
    serviciosComplementarios: cuentaGastos.serviciosComplementarios || 0,
    manejoCarga: cuentaGastos.manejoCarga || 0,
    subtotal: cuentaGastos.subtotal || 0,
    iva: 0.16,
    total: cuentaGastos.total || 0
  });

  await axios.post('http://localhost:5050/pedimentos', {
    cotizacion_id: idCotizacion,
    tipoCambio: pedimento.tipoCambio || 0,
    pesoBruto: pedimento.pesoBruto || 0,
    valorAduana: pedimento.valorAduana || 0,
    dta: pedimento.dta || 0,
    ivaPrv: pedimento.ivaPrv || 0,
    igiIge: pedimento.igiIge || 0,
    prv: pedimento.prv || 0,
    iva: pedimento.iva || 0,
    total: pedimento.total || 0
  });

  await axios.post('http://localhost:5050/desglose-impuestos', {
    cotizacion_id: idCotizacion,
    valorFactura: impuestos.valorFactura || 0,
    flete: impuestos.flete || 0,
    tipoCambio: impuestos.tipoCambio || 0,
    valorAduana: impuestos.valorAduana || 0,
    dta: impuestos.dta || 0,
    igi: impuestos.igi || 0,
    iva: impuestos.iva || 0,
    prv: impuestos.prv || 'No aplica',
    ivaPrv: impuestos.ivaPrv || 'No aplica',
    total: impuestos.total || 0
  });
};

const actualizarSubformularios = async ({ idCotizacion, cargos, cargosExtra, servicios, cuentaGastos, pedimento, impuestos }) => {
  const totalCargosCalculado = parseFloat(cargos.terrestre || 0) + parseFloat(cargos.aereo || 0) + parseFloat(cargos.custodia || 0);

  await axios.put(`http://localhost:5050/cargos/${idCotizacion}`, {
    terrestre: cargos.terrestre || 0,
    aereo: cargos.aereo || 0,
    custodia: cargos.custodia || 0,
    total_cargos: totalCargosCalculado,
    almacenajes: cargosExtra.almacenajes || 0,
    demoras: cargosExtra.demoras || 0,
    pernocta: cargosExtra.pernocta || 0,
    burreo: cargosExtra.burreo || 0,
    flete_falso: cargosExtra.fleteFalso || 0,
    servicio_no_realizado: cargosExtra.servicioNoRealizado || 0,
    seguro: cargosExtra.seguro || 0,
    total_cargos_extra: cargosExtra.total || 0
  });

  await axios.put(`http://localhost:5050/servicios/${idCotizacion}`, {
    maniobras: servicios.maniobras || 0,
    revalidacion: servicios.revalidacion || 0,
    gestionDestino: servicios.gestionDestino || 0,
    inspeccionPeritaje: servicios.inspeccionPeritaje || 0,
    documentacionImportacion: servicios.documentacionImportacion || 0,
    garantiaContenedores: servicios.garantiaContenedores || 0,
    distribucion: servicios.distribucion || 0,
    serentyPremium: servicios.serentyPremium || 0,
    total: servicios.total || 0
  });

  await axios.put(`http://localhost:5050/cuenta-gastos/${idCotizacion}`, {
    honorarios: cuentaGastos.honorarios || 0,
    padron: cuentaGastos.padron || 0,
    serviciosComplementarios: cuentaGastos.serviciosComplementarios || 0,
    manejoCarga: cuentaGastos.manejoCarga || 0,
    subtotal: cuentaGastos.subtotal || 0,
    iva: 0.16,
    total: cuentaGastos.total || 0
  });

  await axios.put(`http://localhost:5050/pedimentos/${idCotizacion}`, {
    tipoCambio: pedimento.tipoCambio || 0,
    pesoBruto: pedimento.pesoBruto || 0,
    valorAduana: pedimento.valorAduana || 0,
    dta: pedimento.dta || 0,
    ivaPrv: pedimento.ivaPrv || 0,
    igiIge: pedimento.igiIge || 0,
    prv: pedimento.prv || 0,
    iva: pedimento.iva || 0,
    total: pedimento.total || 0
  });

  await axios.put(`http://localhost:5050/desglose-impuestos/${idCotizacion}`, {
    valorFactura: impuestos.valorFactura || 0,
    flete: impuestos.flete || 0,
    tipoCambio: impuestos.tipoCambio || 0,
    valorAduana: impuestos.valorAduana || 0,
    dta: impuestos.dta || 0,
    igi: impuestos.igi || 0,
    iva: impuestos.iva || 0,
    prv: impuestos.prv || 'No aplica',
    ivaPrv: impuestos.ivaPrv || 'No aplica',
    total: impuestos.total || 0
  });
};