// ============================================
// 🎯 MIGRACIÓN A NUEVA ESTRUCTURA ORGANIZADA
// ============================================
import { useAuth, useUsers, usePermissions } from '@/hooks/api-hooks'

export function useAuthForm() {
  // Usar los nuevos hooks organizados
  const authHook = useAuth()
  const usersHook = useUsers() 
  const permissionsHook = usePermissions()

  // ============================================
  // 🎯 INTERFAZ COMPATIBLE - Mantiene mismo API
  // ============================================
  
  // Login con redirección por rol automática
  const handleLogin = async (formData) => {
    return await authHook.login(formData)
  }

  // Register con redirección por rol automática
  const handleRegister = async (formData) => {
    return await authHook.register(formData)
  }

  // Logout manteniendo funcionalidad original
  const handleLogout = async () => {
    return await authHook.logout()
  }

  // Obtener usuarios (función de admin)
  const getUsers = async () => {
    return await usersHook.fetchUsers()
  }

  // Obtener permisos de usuario
  const getPermission = async (uid) => {
    return await permissionsHook.fetchMyPermissions(uid)
  }

  // Reset de contraseña
  const handlePasswordReset = async (email) => {
    return await authHook.requestPasswordReset(email)
  }

  return {
    // Estado combinado
    isLoading: authHook.isLoading || usersHook.isLoading || permissionsHook.isLoading,
    error: authHook.error || usersHook.error || permissionsHook.error,
    
    // Funciones originales (mantienen mismos nombres)
    handleLogin,
    handleRegister,
    handleLogout,
    handlePasswordReset,
    getUsers,
    getPermission,
    
    // Clear error
    clearError: () => {
      authHook.clearError()
      usersHook.clearError()
      permissionsHook.clearError()
    }
  }
}
