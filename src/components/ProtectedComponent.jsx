"use client"

import { usePermissions } from "@/hooks/usePermision"

// Componente para proteger contenido basado en permisos
export function ProtectedComponent({ 
  children, 
  permissions, 
  requireAll = false, 
  fallback = null 
}) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isLoading } = usePermissions()



   

 
  if (isLoading) {
    return fallback
  }

  // Si no se especifican permisos, mostrar siempre
  if (!permissions) {
    return children
  }

  // Si es un string, verificar un solo permiso
  if (typeof permissions === 'string') {
    return hasPermission(permissions) ? children : fallback
  }

  // Si es un array, verificar múltiples permisos
  if (Array.isArray(permissions)) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
    
    return hasAccess ? children : fallback
  }

  return fallback
}

// Componente específico para botones protegidos
export function ProtectedButton({ 
  children, 
  permissions, 
  requireAll = false, 
  onClick,
  ...buttonProps 
}) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions()

  // Verificar permisos
  let hasAccess = false
  
  if (!permissions) {
    hasAccess = true
  } else if (typeof permissions === 'string') {
    hasAccess = hasPermission(permissions)
  } else if (Array.isArray(permissions)) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  }

  if (!hasAccess) {
    return null
  }

  return (
    <button onClick={onClick} {...buttonProps}>
      {children}
    </button>
  )
}

// Hook para verificar permisos imperativo
export function usePermissionCheck() {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions()

  const canAccess = (permissions, requireAll = false) => {
    if (!permissions) return true
    
    if (typeof permissions === 'string') {
      return hasPermission(permissions)
    }
    
    if (Array.isArray(permissions)) {
      return requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions)
    }
    
    return false
  }

  return {
    canAccess,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission
  }
}
