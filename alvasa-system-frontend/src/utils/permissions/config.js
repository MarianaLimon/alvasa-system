// src/utils/permissions/config.js
const permisosConfig = {
  '/clientes': [
    { selector: '#btnAgregarCliente',    perm: 'clientes.write',  tooltip: 'No puedes crear clientes, solicita los permisos' },
    { selector: '.btn-editar-cliente',   perm: 'clientes.write',  tooltip: 'No puedes editar clientes, solicita los permisos' },
    { selector: '.btn-eliminar-cliente', perm: 'clientes.delete', tooltip: 'No puedes eliminar clientes, solicita los permisos' },
  ],

  '/cotizaciones': [
    { selector: '#btnNuevaCotizacion',      perm: 'cotizaciones.write' },
    { selector: '.btn-editar-cotizacion',   perm: 'cotizaciones.write' },
    { selector: '.btn-eliminar-cotizacion', perm: 'cotizaciones.delete' },
  ],

  '/pagos-proveedores': [
    { selector: '.btn-registrar-abono',  perm: 'pagos_proveedores.write' },
    { selector: '.btn-eliminar-abono',   perm: 'pagos_proveedores.delete' },
  ],

  // 👇 ESTA pantalla es donde viven también los botones de asignación
  '/procesos-operativos*': [
    // Procesos
    { selector: '#btnNuevoProceso',      perm: 'procesos.write',            tooltip: 'No puedes crear procesos' },
    { selector: '.btn-ver-proceso',      perm: 'procesos.read',             tooltip: 'No puedes ver procesos' },
    { selector: '.btn-editar-proceso',   perm: 'procesos.write',            tooltip: 'No puedes editar procesos' },
    { selector: '.btn-eliminar-proceso', perm: 'procesos.delete',           tooltip: 'No puedes eliminar procesos' },

    // 🔽 Asignación de costos (porque aquí están esos botones)
    { selector: '#btnNuevaAsignacion',      perm: 'asignacion_costos.write',  tooltip: 'No puedes crear asignaciones' },
    { selector: '.btn-ver-asignacion',      perm: 'asignacion_costos.read',   tooltip: 'No puedes ver asignaciones' },
    { selector: '.btn-editar-asignacion',   perm: 'asignacion_costos.write',  tooltip: 'No puedes editar asignaciones' },
    { selector: '.btn-eliminar-asignacion', perm: 'asignacion_costos.delete', tooltip: 'No puedes eliminar asignaciones' },
    { selector: '.btn-exportar-asignacion', perm: 'asignacion_costos.export', tooltip: 'No puedes exportar asignaciones' },
  ],

  // Sigue sirviendo para las vistas propias de asignación (/asignacion-costos/ver|editar|nuevo)
  '/asignacion-costos*': [
    { selector: '#btnNuevaAsignacion',      perm: 'asignacion_costos.write',  tooltip: 'No puedes crear asignaciones' },
    { selector: '.btn-ver-asignacion',      perm: 'asignacion_costos.read',   tooltip: 'No puedes ver asignaciones' },
    { selector: '.btn-editar-asignacion',   perm: 'asignacion_costos.write',  tooltip: 'No puedes editar asignaciones' },
    { selector: '.btn-eliminar-asignacion', perm: 'asignacion_costos.delete', tooltip: 'No puedes eliminar asignaciones' },
    { selector: '.btn-exportar-asignacion', perm: 'asignacion_costos.export', tooltip: 'No puedes exportar asignaciones' },
  ],

  '/usuarios*': [
    { selector: '.perm-switch', perm: 'usuarios.write', tooltip: 'Solo MASTER puede editar permisos' },
    { selector: '.btn-guardar-permisos', perm: 'usuarios.write', tooltip: 'No puedes guardar cambios de permisos' },
  ],
};

export default permisosConfig;
