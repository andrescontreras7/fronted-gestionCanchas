// ============================================
// 🎯 CLIENT API SERVICE (Solo para cliente)
// ============================================
"use client"

import { storage, extractRoleFromJWT } from '@/shared/utils/storage.utils'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// ============================================
// 🔧 FUNCIONES BASE
// ============================================

async function clientApiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('❌ Client API Error:', error)
    throw error
  }
}

async function authenticatedClientCall(endpoint, options = {}) {
  const token = storage.getAuthToken()
  
  if (!token) {
    throw new Error('No hay token de autenticación')
  }
  
  return clientApiCall(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })
}


export const clientAuthService = {
  async login(credentials) {
    
    const response = await clientApiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    

    if (response.access_token) {
      storage.setAuthToken(response.access_token)
      
      const userData = {
        user_id: response.user_id,
        username: response.username,
        email: response.email
      }
      storage.setUserData(userData)
      
      // Estrategia múltiple para obtener el rol
      let roleSet = false
      
      // 1. Intentar obtener rol del JWT inmediatamente
      try {
        const roleFromJWT = extractRoleFromJWT(response.access_token)
        if (roleFromJWT) {
          storage.setUserRole(roleFromJWT)
          roleSet = true
        }
      } catch (error) {
        console.warn('No se pudo extraer rol del JWT:', error)
      }
      
      // 2. Fallback: Obtener rol del perfil (si JWT falló)
      if (!roleSet) {
        try {
          const profile = await this.getProfile()
          if (profile?.role?.name) {
            storage.setUserRole(profile.role.name)
            roleSet = true
          }
        } catch (error) {
          console.warn('No se pudo obtener el rol del perfil:', error)
        }
      }
      
      // 3. Último fallback: rol por defecto
      if (!roleSet) {
        storage.setUserRole('usuario')
      }
    }
    
    return response
  },

  async register(userData) {
    const response = await clientApiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    
    if (response.access_token) {
      storage.setAuthToken(response.access_token)
      if (response.user) {
        storage.setUserData(response.user)
      }
    }
    
    return response
  },

  async logout() {
    storage.clearAuth()
    // Opcional: notificar al servidor
    try {
      await authenticatedClientCall('/auth/logout', { method: 'POST' })
    } catch (error) {
      console.warn('Error notificando logout al servidor:', error)
    }
  },

  async getProfile() {
    return authenticatedClientCall('/user/profile')
  },

  async updateProfile(profileData) {
    const response = await authenticatedClientCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
    
    if (response.user) {
      storage.setUserData(response.user)
    }
    
    return response
  },

  async changePassword(passwordData) {
    return authenticatedClientCall('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    })
  }
}


export const clientUsersService = {
  async getAllUsers() {
    return authenticatedClientCall('/admin/users/')
  },

  async getUserById(userId) {
    return authenticatedClientCall(`/admin/users/${userId}`)
  },

  async updateUser(userId, userData) {
    return authenticatedClientCall(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  },

  async deactivateUser(userId) {
    return authenticatedClientCall(`/admin/users/${userId}/deactivate`, {
      method: 'PUT',
    })
  },

  async activateUser(userId) {
    return authenticatedClientCall(`/admin/users/${userId}/activate`, {
      method: 'PUT',
    })
  }
}


export const clientPermissionsService = {
  async getMyPermissions() {
    return authenticatedClientCall('/user-permissions/my-permissions')
  },

  async getUserPermissions(userId) {
  
    return authenticatedClientCall(`/user-permissions/user/${userId}/all`)
  },

  async getAllPermissions() {

    return authenticatedClientCall('/permissions/list-permissions')
  },

  async updateUserPermissions(userId, permissions) {
    return authenticatedClientCall(`/user-permissions/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    })
  },

  async assignPermissionToUser(userId, permissionName) {
    return authenticatedClientCall('/user-permissions/grant', {
      method: 'POST',
      body: JSON.stringify({ 
        user_id: userId, 
        permission_names: [permissionName]
      }),
    })
  },

  async revokePermissionFromUser(userId, permissionName) {
    return authenticatedClientCall('/user-permissions/revoke', {
      method: 'POST',
      body: JSON.stringify({ 
        user_id: userId, 
        permission_names: [permissionName]
      }),
    })
  },

  async getUserAllPermissions(userId) {
    return authenticatedClientCall(`/permissions/user/${userId}/all`)
  }
}


export function handleClientError(error) {

  
  if (error.message.includes('401')) {
    storage.clearAuth()
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
    return 'Sesión expirada. Por favor, inicia sesión nuevamente.'
  }
  
  if (error.message.includes('403')) {
    return 'No tienes permisos para realizar esta acción.'
  }
  
  if (error.message.includes('400')) {
    return 'Solicitud incorrecta. Verifica los datos ingresados.'
  }
  
  if (error.message.includes('404')) {
    return 'Recurso no encontrado.'
  }
  
  if (error.message.includes('500')) {
    return 'Error interno del servidor. Inténtalo más tarde.'
  }
  
  return error.message || 'Ha ocurrido un error inesperado.'
}
