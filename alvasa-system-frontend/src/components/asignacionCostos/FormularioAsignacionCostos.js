import React, { useState, useEffect } from 'react';
import {
  Card, Form, Row, Col, Button, Accordion
} from 'react-bootstrap';
import { BsSave, BsListUl } from 'react-icons/bs';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import SeleccionarProcesoModal from './SeleccionarProcesoModal';

import AADespacho from './AADespacho';
import Forwarder from './Forwarder';
import FleteTerrestre from './FleteTerrestre';
import Custodia from './Custodia';
import Paqueteria from './Paqueteria';
import Aseguradora from './Aseguradora';
import Despacho from './Despacho';

const FormularioAsignacionCostos = ({ modo = 'crear' }) => {
  console.log("Modo del formulario:", modo);
  const navigate = useNavigate();
  const { folio } = useParams();
  const location = useLocation();
  const [mostrarModal, setMostrarModal] = useState(modo === 'crear');
  const [form, setForm] = useState({
    // Datos generales
    procesoOperativoId: '', clienteId: '', nombreCliente: '', folioProceso: '', cliente: '', ejecutivoCuenta: '',
    noContenedor: '', mercancia: '', tipoCarga: '', salidaAduana: '', aaDespacho: '', forwarder: '',
    consignatario: '', naviera: '', valorMercancia: '',

    // AA Despacho
    importacionCosto: '', importacionVenta: '', almacenajesCosto: '', almacenajesVenta: '',
    servicioCosto: '', servicioVenta: '', tipoServicio1: '', costoServicio1: '', ventaServicio1: '',
    tipoServicio2: '', costoServicio2: '', ventaServicio2: '',

    // Forwarder
    asignadoPor: '', fleteInternacionalCosto: '', fleteInternacionalVenta: '',
    cargosLocalesCosto: '', cargosLocalesVenta: '', demorasCosto: '', demorasVenta: '',
    abonado: '', fechaAbon: '', rembolsado: '', fechaRemb: '',

    // Custodia 
    custodiaProveedor: '', custodiaCosto: '', custodiaVenta: '',
    custodiaPernoctaCosto: '', custodiaPernoctaVenta: '',
    custodiaFalsoCosto: '', custodiaFalsoVenta: '',
    custodiaCancelacionCosto: '', custodiaCancelacionVenta: '',
    custodiaDiasCosto: '', custodiaDiasVenta: '',
    custodiaCostoAlmacenaje: '', custodiaVentaAlmacenaje: '',

    // Flete Terrestre
    proveedor: '', flete: '', fleteVenta: '',
    estadia: '', estadiaVenta: '', burreo: '', burreoVenta: '',
    sobrepeso: '', sobrepesoVenta: '', apoyo: '', apoyoVenta: '',
    pernocta: '', pernoctaVenta: '',

    // Extras flete terrestre (por si usas estos campos individuales aparte)
    extra1: '', extra1Costo: '', extra1Venta: '',
    extra2: '', extra2Costo: '', extra2Venta: '',
    extra3: '', extra3Costo: '', extra3Venta: '',
    extra4: '', extra4Costo: '', extra4Venta: '',
    extra5: '', extra5Costo: '', extra5Venta: '',
    extra6: '', extra6Costo: '', extra6Venta: '',
    extras: [] ,

    // Paquetería
    empresa: '', costo: '', venta: '',

    // Aseguradora
    aseguradora: '', costoAseguradora: '', ventaAseguradora: '',

    // Despacho
    facturacion: '', comisionSocio: '', propuestaCosto: '',
    cotizacionFolio: '', propuestaCotizacion: '', comisionIntermediario: '',
  });

  const cargarProcesoPorId = async (idProceso) => {
    try {
      // Primero, verifica si ya existe una asignación
      const res = await axios.get(`http://localhost:5050/asignacion-costos/proceso/${idProceso}`);
      
      // Si existe, redirige a la edición
      if (res.data && res.data.folio_proceso) {
        navigate(`/asignacion-costos/editar/${res.data.folio_proceso}`, { replace: true });
      }
    } catch (error) {
      // Si no existe, entonces carga el proceso para crear una nueva
      if (error.response && error.response.status === 404) {
        try {
          const resProceso = await axios.get(`http://localhost:5050/procesos-operativos/${idProceso}`);
          const proceso = resProceso.data;

          console.log("✅ Valor de la mercancía precargado:", proceso.valor_mercancia);
          console.log('📦 Proceso recibido:', proceso);

          setForm(prev => ({
            ...prev,
            procesoOperativoId: proceso.id || '',
            clienteId: proceso.cliente_id || '',
            nombreCliente: proceso.cliente || proceso.nombre_cliente || '',
            folioProceso: proceso.folio_proceso || '',
            cliente: proceso.cliente || proceso.nombre_cliente || '',
            ejecutivoCuenta: proceso.ejecutivo_cuenta || '',
            noContenedor: proceso.informacion_embarque?.no_contenedor || '',
            mercancia: proceso.mercancia || '',
            tipoCarga: proceso.tipo_carga || '',
            salidaAduana: proceso.salida_retorno_contenedor?.salida_aduana || '',
            aaDespacho: proceso.datos_pedimento?.aa_despacho || '',
            forwarder: proceso.informacion_embarque?.forwarde || '',
            consignatario: proceso.informacion_embarque?.consignatario || '',
            naviera: proceso.informacion_embarque?.naviera || '',
            valorMercancia: proceso.valor_mercancia || '',
          }));

          setMostrarModal(false);
        } catch (err) {
          console.error('Error al cargar proceso operativo:', err);
        }
      } else {
        console.error('Error al verificar asignación existente:', error);
      }
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toISOString().split('T')[0];
  };


  useEffect(() => {
    const cargarAsignacion = async () => {
      if (modo === 'editar' && folio) {
        try {
          const { data } = await axios.get(`http://localhost:5050/asignacion-costos/completo/${folio}`);

          // Datos principales
          setForm(prev => ({
            ...prev,
            asignacionId: data.id || '',
            procesoOperativoId: data.proceso_operativo_id || '',
            clienteId: data.cliente_id || '',
            nombreCliente: data.nombre_cliente || '',
            folioProceso: data.folio_proceso || '',
            cliente: data.nombre_cliente || '',
            ejecutivoCuenta: data.ejecutivo_cuenta || '',
            noContenedor: data.no_contenedor || '',
            mercancia: data.mercancia || '',
            tipoCarga: data.tipo_carga || '',
            salidaAduana: data.salida_aduana || ''
          }));

          // AA Despacho
          const aa = data.aa_despacho || {};
          setForm(prev => ({
            ...prev,
            aaDespacho: aa.aa_despacho || '',
            importacionCosto: parseFloat(aa.importacion_costo) || 0,
            importacionVenta: parseFloat(aa.importacion_venta) || 0,
            almacenajesCosto: parseFloat(aa.almacenajes_costo) || 0,
            almacenajesVenta: parseFloat(aa.almacenajes_venta) || 0,
            servicioCosto: parseFloat(aa.servicio_costo) || 0,
            servicioVenta: parseFloat(aa.servicio_venta) || 0,
            costoServicio1: parseFloat(aa.costo_servicio1) || 0,
            ventaServicio1: parseFloat(aa.venta_servicio1) || 0,
            costoServicio2: parseFloat(aa.costo_servicio2) || 0,
            ventaServicio2: parseFloat(aa.venta_servicio2) || 0,
            tipoServicio1: aa.tipo_servicio1 || '',
            tipoServicio2: aa.tipo_servicio2 || ''
          }));

          // Forwarder
          const fw = data.forwarder || {};
          setForm(prev => ({
            ...prev,
            forwarder: fw.forwarder || '',
            asignadoPor: fw.asignado_por || '',
            consignatario: fw.consignatario || '',
            naviera: fw.naviera || '',
            fleteInternacionalCosto: fw.flete_internacional_costo || '',
            fleteInternacionalVenta: fw.flete_internacional_venta || '',
            cargosLocalesCosto: fw.cargos_locales_costo || '',
            cargosLocalesVenta: fw.cargos_locales_venta || '',
            demorasCosto: fw.demoras_costo || '',
            demorasVenta: fw.demoras_venta || '',
            tipoServicioExtra: fw.tipo_servicio_extra || '',
            costoServicioExtra: fw.costo_servicio_extra || '',
            ventaServicioExtra: fw.venta_servicio_extra || '',
            abonado: fw.abonado || '',
            fechaAbon: formatearFecha(fw.fecha_abon),
            rembolsado: fw.rembolsado || '',
            fechaRemb: formatearFecha(fw.fecha_remb)
          }));

          // Flete Terrestre
          try {
            const resFlete = await axios.get(`http://localhost:5050/asignacion-costos/flete-terrestre/${data.id}`);
            const flete = resFlete.data;

            setForm(prev => ({
              ...prev,
              proveedor: flete.proveedor || '',
              flete: flete.flete || '',
              fleteVenta: flete.flete_venta || '',
              estadia: flete.estadia || '',
              estadiaVenta: flete.estadia_venta || '',
              burreo: flete.burreo || '',
              burreoVenta: flete.burreo_venta || '',
              sobrepeso: flete.sobrepeso || '',
              sobrepesoVenta: flete.sobrepeso_venta || '',
              apoyo: flete.apoyo || '',
              apoyoVenta: flete.apoyo_venta || '',
              pernocta: flete.pernocta || '',
              pernoctaVenta: flete.pernocta_venta || '',
              extras: flete.extras || [],
              extra1: flete.extras?.[0]?.concepto || '',
              extra1Costo: flete.extras?.[0]?.costo || '',
              extra1Venta: flete.extras?.[0]?.venta || '',
              extra2: flete.extras?.[1]?.concepto || '',
              extra2Costo: flete.extras?.[1]?.costo || '',
              extra2Venta: flete.extras?.[1]?.venta || '',
              extra3: flete.extras?.[2]?.concepto || '',
              extra3Costo: flete.extras?.[2]?.costo || '',
              extra3Venta: flete.extras?.[2]?.venta || ''
            }));
          } catch (error) {
            console.warn('⚠️ No se encontró Flete Terrestre para esta asignación:', error?.response?.status);
          }
          
          // Custodia
          const custodia = data.custodia || {};
          setForm(prev => ({
            ...prev,
            custodiaProveedor: custodia.custodia_proveedor || '',
            custodiaCosto: custodia.custodia_costo || '',
            custodiaVenta: custodia.custodia_venta || '',
            custodiaPernoctaCosto: custodia.custodia_pernocta_costo || '',
            custodiaPernoctaVenta: custodia.custodia_pernocta_venta || '',
            custodiaFalsoCosto: custodia.custodia_falso_costo || '',
            custodiaFalsoVenta: custodia.custodia_falso_venta || '',
            custodiaCancelacionCosto: custodia.custodia_cancelacion_costo || '',
            custodiaCancelacionVenta: custodia.custodia_cancelacion_venta || '',
            custodiaDiasCosto: custodia.custodia_dias_costo || '',
            custodiaDiasVenta: custodia.custodia_dias_venta || '',
            custodiaCostoAlmacenaje: custodia.custodia_costo_almacenaje || '',
            custodiaVentaAlmacenaje: custodia.custodia_venta_almacenaje || ''
          }));

          // Paquetería
          try {
            const resPaqueteria = await axios.get(`http://localhost:5050/asignacion-costos/paqueteria/${data.id}`);
            const paqueteria = resPaqueteria.data;

            setForm(prev => ({
              ...prev,
              empresa: paqueteria.empresa || '',
              costo: paqueteria.costo || '',
              venta: paqueteria.venta || ''
            }));
          } catch (error) {
            console.warn('⚠️ No se encontró Paquetería para esta asignación:', error?.response?.status);
          }

          // Aseguradora
          try {
            const resAseguradora = await axios.get(`http://localhost:5050/asignacion-costos/aseguradora/${data.id}`);
            const aseguradora = resAseguradora.data;

            setForm(prev => ({
              ...prev,
              aseguradora: aseguradora.aseguradora || '',
              costoAseguradora: aseguradora.costo || '',
              ventaAseguradora: aseguradora.venta || '',
              valorMercancia: aseguradora.valor_mercancia || ''
            }));
          } catch (error) {
            console.warn('⚠️ No se encontró Aseguradora para esta asignación:', error?.response?.status);
          }

          // Despacho
          try {
            const resDespacho = await axios.get(`http://localhost:5050/asignacion-costos/despacho/${data.id}`);
            const despacho = resDespacho.data;

            setForm(prev => ({
              ...prev,
              facturacion: despacho.facturacion || '',
              comisionSocio: despacho.comision_socio || '',
              propuestaCosto: despacho.propuesta_costo || '',
              cotizacionFolio: despacho.cotizacion_folio || '',
              propuestaCotizacion: parseFloat(despacho.propuesta) || 0,
              comisionIntermediario: despacho.comision_intermediario || ''
            }));
          } catch (error) {
            console.warn('⚠️ No se encontró Despacho para esta asignación:', error?.response?.status);
          }

          setMostrarModal(false);
        } catch (error) {
          console.error('❌ Error al cargar asignación completa:', error);
        }
      }

      // En modo crear, verificar si ya hay asignación para este folio
      if (modo === 'crear' && folio) {
        try {
          const { data } = await axios.get(`http://localhost:5050/asignacion-costos/folio/${folio}`);
          if (data?.id) {
            navigate(`/asignacion-costos/editar/${data.folio_proceso}`);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            try {
              const resProceso = await axios.get(`http://localhost:5050/procesos-operativos/folio/${folio}`);
              const proceso = resProceso.data;

              setForm(prev => ({
                ...prev,
                procesoOperativoId: proceso.id,
                folioProceso: proceso.folio_proceso,
                clienteId: proceso.cliente_id,
                nombreCliente: proceso.cliente,
                ejecutivoCuenta: proceso.ejecutivo_cuenta,
                noContenedor: proceso.informacion_embarque?.no_contenedor || '',
                mercancia: proceso.mercancia,
                tipoCarga: proceso.tipo_carga,
                salidaAduana: proceso.salida_retorno_contenedor?.salida_aduana || '',
                valorMercancia: proceso.valor_mercancia || ''
              }));

              console.log('✅ Valor de la mercancía precargado:', proceso.valor_mercancia);

              setMostrarModal(false);
            } catch (e) {
              console.error('❌ Error al cargar proceso operativo por folio:', e);
            }
          } else {
            console.error('❌ Error al verificar asignación existente:', error);
          }
        }
      }
    };

    cargarAsignacion();
  }, [modo, folio, location.key, navigate]);


  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // ─────────────────────────────────────────────────────
    // 1️⃣ Crear o actualizar la asignación principal
    // ─────────────────────────────────────────────────────
    // Sanitizar valorMercancia
    const valorMercanciaLimpio =
      form.valorMercancia?.toString().trim() !== "" && !isNaN(form.valorMercancia)
        ? form.valorMercancia
        : 0;
    const formLimpio = { ...form, valorMercancia: valorMercanciaLimpio };

    let asignacionId;
    if (modo === "editar") {
      console.log("🟠 Actualizando asignación ID:", form.asignacionId);
      await axios.put(
        `http://localhost:5050/asignacion-costos/${form.asignacionId}`,
        formLimpio
      );
      asignacionId = form.asignacionId;
    } else {
      console.log("🟡 Creando nueva asignación:", formLimpio);
      const res = await axios.post(
        "http://localhost:5050/asignacion-costos",
        formLimpio
      );
      asignacionId = res.data.id;
      console.log("🆔 Nueva asignación ID:", asignacionId);
    }

    // ─────────────────────────────────────────────────────
    // 2️⃣ AA Despacho
    // ─────────────────────────────────────────────────────
    const datosAADespacho = {
      aaDespacho: form.aaDespacho,
      importacionCosto: parseFloat(form.importacionCosto) || 0,
      importacionVenta: parseFloat(form.importacionVenta) || 0,
      almacenajesCosto: parseFloat(form.almacenajesCosto) || 0,
      almacenajesVenta: parseFloat(form.almacenajesVenta) || 0,
      servicioCosto: parseFloat(form.servicioCosto) || 0,
      servicioVenta: parseFloat(form.servicioVenta) || 0,
      tipoServicio1: form.tipoServicio1,
      costoServicio1: parseFloat(form.costoServicio1) || 0,
      ventaServicio1: parseFloat(form.ventaServicio1) || 0,
      tipoServicio2: form.tipoServicio2,
      costoServicio2: parseFloat(form.costoServicio2) || 0,
      ventaServicio2: parseFloat(form.ventaServicio2) || 0,
    };
    console.log("📤 AA Despacho:", datosAADespacho);
    await axios.post(
      `http://localhost:5050/asignacion-costos/aa-despacho/${asignacionId}`,
      datosAADespacho
    );

    // ─────────────────────────────────────────────────────
    // 3️⃣ Forwarder
    // ─────────────────────────────────────────────────────
    const datosForwarder = {
      asignadoPor: form.asignadoPor,
      fleteInternacionalCosto: parseFloat(form.fleteInternacionalCosto) || 0,
      fleteInternacionalVenta: parseFloat(form.fleteInternacionalVenta) || 0,
      cargosLocalesCosto: parseFloat(form.cargosLocalesCosto) || 0,
      cargosLocalesVenta: parseFloat(form.cargosLocalesVenta) || 0,
      demorasCosto: parseFloat(form.demorasCosto) || 0,
      demorasVenta: parseFloat(form.demorasVenta) || 0,
      tipoServicioExtra: form.tipoServicioExtra,
      costoServicioExtra: form.costoServicioExtra,
      ventaServicioExtra: form.ventaServicioExtra,
      abonado: form.abonado,
      fechaAbon: form.fechaAbon,
      rembolsado: form.rembolsado,
      fechaRemb: form.fechaRemb,
      consignatario: form.consignatario,
      naviera: form.naviera,
      forwarder: form.forwarder,
    };
    console.log("📤 Forwarder:", datosForwarder);
    await axios.post(
      `http://localhost:5050/asignacion-costos/forwarder/${asignacionId}`,
      datosForwarder
    );

    // ─────────────────────────────────────────────────────
    // 4️⃣ Flete Terrestre
    // ─────────────────────────────────────────────────────
    const extras = [];
    for (let i = 1; i <= 6; i++) {
      const c = form[`extra${i}`]?.trim();
      const co = parseFloat(form[`extra${i}Costo`]) || 0;
      const ve = parseFloat(form[`extra${i}Venta`]) || 0;
      if (c || co > 0 || ve > 0) extras.push({ concepto: c, costo: co, venta: ve });
    }
    const datosFlete = {
      proveedor: form.proveedor,
      flete: parseFloat(form.flete) || 0,
      fleteVenta: parseFloat(form.fleteVenta) || 0,
      estadia: parseFloat(form.estadia) || 0,
      estadiaVenta: parseFloat(form.estadiaVenta) || 0,
      burreo: parseFloat(form.burreo) || 0,
      burreoVenta: parseFloat(form.burreoVenta) || 0,
      sobrepeso: parseFloat(form.sobrepeso) || 0,
      sobrepesoVenta: parseFloat(form.sobrepesoVenta) || 0,
      apoyo: parseFloat(form.apoyo) || 0,
      apoyoVenta: parseFloat(form.apoyoVenta) || 0,
      pernocta: parseFloat(form.pernocta) || 0,
      pernoctaVenta: parseFloat(form.pernoctaVenta) || 0,
      extras,
    };
    console.log("📤 Flete Terrestre:", datosFlete);
    await axios.post(
      `http://localhost:5050/asignacion-costos/flete-terrestre/${asignacionId}`,
      datosFlete
    );

    // ─────────────────────────────────────────────────────
    // 5️⃣ Custodia
    // ─────────────────────────────────────────────────────
    const datosCustodia = {
      custodiaProveedor: form.custodiaProveedor,
      custodiaCosto: parseFloat(form.custodiaCosto) || 0,
      custodiaVenta: parseFloat(form.custodiaVenta) || 0,
      custodiaPernoctaCosto: parseFloat(form.custodiaPernoctaCosto) || 0,
      custodiaPernoctaVenta: parseFloat(form.custodiaPernoctaVenta) || 0,
      custodiaFalsoCosto: parseFloat(form.custodiaFalsoCosto) || 0,
      custodiaFalsoVenta: parseFloat(form.custodiaFalsoVenta) || 0,
      custodiaCancelacionCosto: parseFloat(form.custodiaCancelacionCosto) || 0,
      custodiaCancelacionVenta: parseFloat(form.custodiaCancelacionVenta) || 0,
      custodiaDiasCosto: parseFloat(form.custodiaDiasCosto) || 0,
      custodiaDiasVenta: parseFloat(form.custodiaDiasVenta) || 0,
      custodiaCostoAlmacenaje: parseFloat(form.custodiaCostoAlmacenaje) || 0,
      custodiaVentaAlmacenaje: parseFloat(form.custodiaVentaAlmacenaje) || 0,
    };
    console.log("📤 Custodia:", datosCustodia);
    await axios.post(
      `http://localhost:5050/asignacion-costos/custodia/${asignacionId}`,
      datosCustodia
    );

    // ─────────────────────────────────────────────────────
    // 6️⃣ Paquetería
    // ─────────────────────────────────────────────────────
    const datosPaqueteria = {
      empresa: form.empresa,
      costo: parseFloat(form.costo) || 0,
      venta: parseFloat(form.venta) || 0,
    };
    console.log("📤 Paquetería:", datosPaqueteria);
    await axios.post(
      `http://localhost:5050/asignacion-costos/paqueteria/${asignacionId}`,
      datosPaqueteria
    );

    // ─────────────────────────────────────────────────────
    // 7️⃣ Aseguradora
    // ─────────────────────────────────────────────────────
    const datosAseguradora = {
      aseguradora: form.aseguradora,
      costo: parseFloat(form.costoAseguradora) || 0,
      venta: parseFloat(form.ventaAseguradora) || 0,
      valorMercancia: parseFloat(form.valorMercancia) || 0
    };

    console.log("📤 Aseguradora:", datosAseguradora);
    await axios.post(
      `http://localhost:5050/asignacion-costos/aseguradora/${asignacionId}`,
      datosAseguradora
    );

    // ─────────────────────────────────────────────────────
    // 8️⃣ Despacho
    // ─────────────────────────────────────────────────────
    const datosDespacho = {
      facturacion: parseFloat(form.facturacion) || 0,
      comisionSocio: parseFloat(form.comisionSocio) || 0,
      propuestaCosto: parseFloat(form.propuestaCosto) || 0,
      cotizacionFolio: form.cotizacionFolio || '',
      propuestaCotizacion: parseFloat(form.propuestaCotizacion) || 0,
      comisionIntermediario: parseFloat(form.comisionIntermediario) || 0
    };
    console.log("📤 Despacho:", datosDespacho);
    await axios.post(
      `http://localhost:5050/asignacion-costos/despacho/${asignacionId}`,
      datosDespacho
    );

    // ─────────────────────────────────────────────────────
    alert("✅ Asignación y subformularios guardados correctamente");
    navigate("/procesos-operativos");
  } catch (error) {
    console.error("❌ Error al guardar:", error);
    alert("Hubo un error al guardar la asignación");
  }
};

  console.log("🧾 form.valorMercancia:", form.valorMercancia);

  return (
    <>
      {modo === 'crear' && (
        <SeleccionarProcesoModal
          mostrar={mostrarModal}
          onSeleccionar={cargarProcesoPorId}
        />
      )}

      {!mostrarModal && (
        <Form onSubmit={handleSubmit}>
          <Card className="container-cotizaciones">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="title-reg-po">Asignación de Costos</Card.Title>
                <div style={{ width: '200px' }}>
                  <Form.Label>Folio Proceso</Form.Label>
                  <Form.Control type="text" value={form.folioProceso} disabled />
                </div>
              </div>

              <h5 className="mb-3 title-section">Datos Generales del Proceso</h5>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Cliente</Form.Label>
                    <Form.Control type="text" value={form.cliente} disabled className="text-uppercase" />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Ejecutivo de Cuenta</Form.Label>
                    <Form.Control type="text" value={form.ejecutivoCuenta} disabled className="text-uppercase" />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Mercancía</Form.Label>
                    <Form.Control type="text" value={form.mercancia} disabled className="text-uppercase" />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-5">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>No. Contenedor</Form.Label>
                    <Form.Control type="text" value={form.noContenedor} disabled className="text-uppercase" />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Tipo de Carga</Form.Label>
                    <Form.Control type="text" value={form.tipoCarga} disabled className="text-uppercase" />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Salida de Aduana</Form.Label>
                    <Form.Control type="text" value={form.salidaAduana} disabled className="text-uppercase" />
                  </Form.Group>
                </Col>
              </Row>

              <Accordion defaultActiveKey="0" className="mb-4 text-uppercase">

                <Accordion.Item eventKey="0">
                  <Accordion.Header>Despacho</Accordion.Header>
                  <Accordion.Body>
                    <Despacho
                      datos={{
                        facturacion: form.facturacion,
                        comisionSocio: form.comisionSocio,
                        propuestaCosto: form.propuestaCosto,
                        cotizacionFolio: form.cotizacionFolio,
                        propuestaCotizacion: form.propuestaCotizacion,
                        comisionIntermediario: form.comisionIntermediario
                      }}
                      onChange={(datos) => setForm(prev => ({ ...prev, ...datos }))}
                    />
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                  <Accordion.Header>AA Despacho</Accordion.Header>
                  <Accordion.Body>
                    <AADespacho
                      datos={{
                        aaDespacho: form.aaDespacho,
                        importacionCosto: form.importacionCosto,
                        importacionVenta: form.importacionVenta,
                        almacenajesCosto: form.almacenajesCosto,
                        almacenajesVenta: form.almacenajesVenta,
                        servicioCosto: form.servicioCosto,
                        servicioVenta: form.servicioVenta,
                        tipoServicio1: form.tipoServicio1,
                        costoServicio1: form.costoServicio1,
                        ventaServicio1: form.ventaServicio1,
                        tipoServicio2: form.tipoServicio2,
                        costoServicio2: form.costoServicio2,
                        ventaServicio2: form.ventaServicio2,
                      }}
                      costoDespachoCot={form.costo_despacho}
                      propuestaCot={form.propuestaCotizacion}
                      onChange={(datos) => setForm(prev => ({ ...prev, ...datos }))}
                    />
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header>Forwarder</Accordion.Header>
                  <Accordion.Body>
                    <Forwarder datos={form} onChange={(datos) => setForm(prev => ({ ...prev, ...datos }))} />
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3">
                  <Accordion.Header>Flete Terrestre</Accordion.Header>
                  <Accordion.Body>
                    <FleteTerrestre datos={form} onChange={(nuevosCampos) => setForm(prev => ({ ...prev, ...nuevosCampos }))} />
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="4">
                  <Accordion.Header>Custodia</Accordion.Header>
                  <Accordion.Body>
                    <Custodia datos={form} onChange={(datos) => setForm(prev => ({ ...prev, ...datos }))} />
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="5">
                  <Accordion.Header>Empresa Paquetería</Accordion.Header>
                  <Accordion.Body>
                    <Paqueteria datos={form} onChange={(datos) => setForm(prev => ({ ...prev, ...datos }))} />
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="6">
                  <Accordion.Header>Aseguradora</Accordion.Header>
                  <Accordion.Body>
                    <Aseguradora
                      datos={{
                        aseguradora: form.aseguradora,
                        costo: form.costoAseguradora,
                        venta: form.ventaAseguradora,
                        valorMercancia: form.valorMercancia
                      }}
                      onChange={(datos) =>
                        setForm((prev) => ({
                          ...prev,
                          aseguradora: datos.aseguradora,
                          costoAseguradora: datos.costo,
                          ventaAseguradora: datos.venta,
                          valorMercancia: datos.valorMercancia
                        }))
                      }
                    />
                  </Accordion.Body>
                </Accordion.Item>            
              </Accordion>
              

              <div className="d-flex justify-content-center gap-3">
                <Button type="submit" variant="success">
                  <BsSave className="me-2" />
                  Guardar Asignación de Costos
                </Button>
                <Button variant="warning" onClick={() => navigate('/procesos-operativos')}>
                  <BsListUl className="me-2" />
                  Volver a la lista
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Form>
      )}
    </>
  );

};

export default FormularioAsignacionCostos;