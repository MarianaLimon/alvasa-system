const permisosConfig = {
  '/clientes': [
    { selector: '#btnAgregarCliente',    perm: 'clientes.write',
      tooltip: 'No puedes crear clientes, solicita los permisos' },
    { selector: '.btn-editar-cliente',   perm: 'clientes.write',
      tooltip: 'No puedes editar clientes, solicita los permisos' },
    { selector: '.btn-eliminar-cliente', perm: 'clientes.delete',
      tooltip: 'No puedes eliminar clientes, solicita los permisos' },
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
};

export default permisosConfig;