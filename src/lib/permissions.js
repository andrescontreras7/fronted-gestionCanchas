// Definición de permisos del sistema - Exactos de tu BD
export const PERMISSIONS = {
  // Reservas
  CREAR_RESERVAS: 'crear_reservas',
  VER_RESERVAS: 'ver_reservas',
  EDITAR_RESERVAS: 'editar_reservas',
  CANCELAR_RESERVAS: 'cancelar_reservas',
  APROBAR_RESERVAS: 'aprobar_reservas', 
  ELIMINAR_RESERVAS: 'eliminar_reservas', 
  GESTIONAR_CHECKIN: 'gestionar_checkin', // Nuevo: para check-in/check-out
  
  // Usuarios
  CREAR_USUARIOS: 'crear_usuarios',
  VER_USUARIOS: 'ver_usuarios',
  EDITAR_USUARIOS: 'editar_usuarios',
  ELIMINAR_USUARIOS: 'eliminar_usuarios',
  
  // Canchas
  VER_CANCHAS: 'ver_canchas',
  CREAR_CANCHAS: 'crear_canchas',
  EDITAR_CANCHAS: 'editar_canchas',
  ELIMINAR_CANCHAS: 'eliminar_canchas',
  
  // Roles y Permisos
  ASIGNAR_ROLES: 'asignar_roles',
  GESTIONAR_ROLES: 'gestionar_roles',
  GESTIONAR_PERMISOS: 'gestionar_permisos',
  OTORGAR_PERMISOS: 'otorgar_permisos',
  
  // Pagos
  VER_PAGOS: 'ver_pagos',
  PROCESAR_PAGOS: 'procesar_pagos',
  GENERAR_FACTURAS: 'generar_facturas',
  
  // Reportes y Estadísticas
  VER_REPORTES: 'ver_reportes',
  GENERAR_REPORTES: 'generar_reportes',
  VER_ESTADISTICAS: 'ver_estadisticas',
  
  // Sistema
  MANTENIMIENTO_SISTEMA: 'mantenimiento_sistema',
  CONFIGURAR_SISTEMA: 'configurar_sistema',
  BACKUP_DATOS: 'backup_datos',
  VER_LOGS: 'ver_logs'
}

// Grupos de permisos por rol según tu sistema
export const ROLE_PERMISSIONS = {
  administrador: [
    // Reservas - Control total
    PERMISSIONS.CREAR_RESERVAS,
    PERMISSIONS.VER_RESERVAS,
    PERMISSIONS.EDITAR_RESERVAS,
    PERMISSIONS.CANCELAR_RESERVAS,
    
    // Usuarios - Control total
    PERMISSIONS.CREAR_USUARIOS,
    PERMISSIONS.VER_USUARIOS,
    PERMISSIONS.EDITAR_USUARIOS,
    PERMISSIONS.ELIMINAR_USUARIOS,
    
    // Canchas - Control total
    PERMISSIONS.VER_CANCHAS,
    PERMISSIONS.CREAR_CANCHAS,
    PERMISSIONS.EDITAR_CANCHAS,
    PERMISSIONS.ELIMINAR_CANCHAS,
    
    // Roles y Permisos - Control total
    PERMISSIONS.ASIGNAR_ROLES,
    PERMISSIONS.GESTIONAR_ROLES,
    PERMISSIONS.GESTIONAR_PERMISOS,
    PERMISSIONS.OTORGAR_PERMISOS,
    
    // Pagos - Control total
    PERMISSIONS.VER_PAGOS,
    PERMISSIONS.PROCESAR_PAGOS,
    PERMISSIONS.GENERAR_FACTURAS,
    
    // Reportes - Control total
    PERMISSIONS.VER_REPORTES,
    PERMISSIONS.GENERAR_REPORTES,
    PERMISSIONS.VER_ESTADISTICAS,
    
    // Sistema - Control total
    PERMISSIONS.MANTENIMIENTO_SISTEMA,
    PERMISSIONS.CONFIGURAR_SISTEMA,
    PERMISSIONS.BACKUP_DATOS,
    PERMISSIONS.VER_LOGS
  ],
  
  
  
 
  
  usuario: [
    // Reservas - Solo crear sus propias reservas
    PERMISSIONS.CREAR_RESERVAS,
    PERMISSIONS.VER_RESERVAS,
    
    // Canchas - Solo ver disponibilidad
    PERMISSIONS.VER_CANCHAS
  ]
}

// Función helper para verificar permisos
export const checkPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false
  }
  return userPermissions.includes(requiredPermission)
}

export const checkMultiplePermissions = (userPermissions, requiredPermissions, requireAll = false) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false
  }
  
  if (requireAll) {
    return requiredPermissions.every(permission => userPermissions.includes(permission))
  } else {
    return requiredPermissions.some(permission => userPermissions.includes(permission))
  }
}

// Función para obtener permisos por rol (útil para testing)
export const getPermissionsByRole = (role) => {
  return ROLE_PERMISSIONS[role] || []
}

// Funciones específicas para verificar permisos comunes
export const canCreateReservations = (userPermissions) => {
  return checkPermission(userPermissions, PERMISSIONS.CREAR_RESERVAS)
}

export const canViewUsers = (userPermissions) => {
  return checkPermission(userPermissions, PERMISSIONS.VER_USUARIOS)
}

export const canManageUsers = (userPermissions) => {
  return checkMultiplePermissions(userPermissions, [
    PERMISSIONS.CREAR_USUARIOS,
    PERMISSIONS.EDITAR_USUARIOS,
    PERMISSIONS.ELIMINAR_USUARIOS
  ], false) // Solo necesita uno de estos permisos
}

export const canManageCourts = (userPermissions) => {
  return checkMultiplePermissions(userPermissions, [
    PERMISSIONS.CREAR_CANCHAS,
    PERMISSIONS.EDITAR_CANCHAS,
    PERMISSIONS.ELIMINAR_CANCHAS
  ], false)
}

export const canViewReports = (userPermissions) => {
  return checkPermission(userPermissions, PERMISSIONS.VER_REPORTES)
}

export const canManageSystem = (userPermissions) => {
  return checkMultiplePermissions(userPermissions, [
    PERMISSIONS.MANTENIMIENTO_SISTEMA,
    PERMISSIONS.CONFIGURAR_SISTEMA,
    PERMISSIONS.BACKUP_DATOS
  ], false)
}
