import { apiCall, authenticatedApiCall } from '@/shared/services/api.service'
import { storage } from '@/shared/utils/storage.utils'


export const authService = {

  async login(credentials) {
    const {email, password} = credentials
    
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    })
    
    
    let userData = null
    
    if (response.access_token) {
      storage.setAuthToken(response.access_token)
      
      try {
        // Obtener datos del usuario después de login exitoso
        userData = await this.verifyRolesByToken()
      } catch (error) {
        // Continuar sin romper el flujo
      }
    }
    
    // Guardar datos del usuario desde la respuesta del login
    const userDataToSave = {
      user_id: response.user_id,
      username: response.username,
      email: response.email
    }
    
    storage.setUserData(userDataToSave)
    
    // Solo guardar rol si tenemos userData válido
    if (userData && userData.role) {
      storage.setUserRole(userData.role)
    } else {
      // Usar rol por defecto si no se pudo obtener
      storage.setUserRole('usuario')
    }

    return response
  },


  async register(userData) {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
      }),
    })

    if (response.access_token || response.token) {
      // Guardar el token (puede venir como access_token o token)
      const token = response.access_token || response.token
      storage.setAuthToken(token)
      
      // Obtener datos del usuario después del registro
      try {
        const userProfile = await this.verifyRolesByToken()
        
        if (userProfile && userProfile.role) {
          storage.setUserRole(userProfile.role.name)
        }
      } catch (error) {
        console.error('Error obteniendo perfil después del registro:', error)
      }
    }

    if (response.user) {
      storage.setUserData(response.user)
    }

    return response
  },

  async verifyRolesByToken() {
    try {
      const response = await authenticatedApiCall('/user/profile')

      if (response && response.role) {
        // Guardar el rol en el storage
        if (response.role.name) {
          storage.setUserRole(response.role.name)
        }
      } else {
      }

      return response
    } catch (error) {
      throw error
    }
  },

  async logout() {
    try {
     storage.clearAuth()
    } catch (error) {
      console.error('Error durante logout en el servidor:', error)
    } finally {
  
      
    }
  },

  /**
  
   * @returns {Promise<object>} - Datos del usuario actual
   */
  async verifyToken() {
    const response = await authenticatedApiCall('/auth/verify')
    
    // Actualizar datos del usuario si han cambiado
    if (response.user) {
      storage.setUserData(response.user)
    }

    return response
  },

  async requestPasswordReset(email) {
    return apiCall('/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  /**
   * Restablecer contraseña con token
   * @param {object} resetData - Token y nueva contraseña
   * @returns {Promise<object>}
   */
  async resetPassword(resetData) {
    return apiCall('/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify({
        token: resetData.token,
        password: resetData.password,
      }),
    })
  },

  /**
   * Cambiar contraseña (usuario autenticado)
   * @param {object} passwordData - Contraseña actual y nueva
   * @returns {Promise<object>}
   */
  async changePassword(passwordData) {
    return authenticatedApiCall('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }),
    })
  },

  /**
   * Obtener perfil del usuario actual
   * @returns {Promise<object>}
   */
  async getCurrentUser() {
  
    const response = await authenticatedApiCall('/auth/profile')
    
    if (response.user) {
      storage.setUserData(response.user)
    }

    return response
  },

  async permissionUser() {

    const response = await authenticatedApiCall(`/user-permissions/my-permissions`, {
      method: 'GET',
    })
    
    if (response) {
    }
    
    return response
  },


  async updateProfile(profileData) {
    const response = await authenticatedApiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })

    if (response.user) {
      storage.setUserData(response.user)
    }

    return response
  }
}
