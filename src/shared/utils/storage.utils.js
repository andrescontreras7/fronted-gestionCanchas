/**
 * Utilidades para manejar el almacenamiento local de forma segura
 */

const AUTH_TOKEN_KEY = 'auth_token'
const USER_DATA_KEY = 'user_data'

export const storage = {
  /**
   * Guardar token de autenticación
   * @param {string} token 
   */
  setAuthToken(token) {
    try {
      // Guardar en localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, token)


      if (typeof document !== 'undefined') {
        document.cookie = `auth_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Strict`
      }
    } catch (error) {
      console.error('Error guardando token:', error)
    }
  },

  /**
   * Guardar rol del usuario
   * @param {string} role 
   */
  setUserRole(role) {
    try {
      // Guardar en localStorage
      localStorage.setItem('user_role', role)

      // También guardar en cookies para el middleware
      if (typeof document !== 'undefined') {
        document.cookie = `user_role=${role}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Strict`
      }
    } catch (error) {
      console.error('Error guardando rol:', error)
    }
  },

  /**
   * Obtener token de autenticación
   * @returns {string|null}
   */
  getAuthToken() {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY)
    } catch (error) {
      console.error('Error obteniendo token:', error)
      return null
    }
  },

  /**
   * Eliminar token de autenticación
   */
  removeAuthToken() {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      
      // También eliminar de cookies (solo en el navegador)
      if (typeof document !== 'undefined') {
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    } catch (error) {
      console.error('Error eliminando token:', error)
    }
  },

  /**
   * Guardar datos del usuario
   * @param {object} userData 
   */
  setUserData(userData) {
    try {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
    } catch (error) {
      console.error('Error guardando datos del usuario:', error)
    }
  },


  /**
   * Guardar datos del usuario y extraer el rol
   * @param {object|string} roleData - Puede ser un objeto con name o directamente el string del rol
   */
  setRoleUser(roleData) {
    try {

      
      let roleName = null
      
      // Si es un objeto con propiedad name
      if (roleData && typeof roleData === 'object' && roleData.name) {
        roleName = roleData.name
      }
      // Si es directamente un string
      else if (typeof roleData === 'string') {
        roleName = roleData
      }
      
      if (roleName) {
        // Guardar en localStorage
        localStorage.setItem('user_role', roleName)
        
        // También guardar en cookies para el middleware
        if (typeof document !== 'undefined') {
          document.cookie = `user_role=${roleName}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Strict`
        }

      } else {
        console.warn('No se pudo extraer el rol de:', roleData)
      }
    } catch (error) {
      console.error('Error guardando rol del usuario:', error)
    }
  },
  /**
   * Obtener datos del usuario
   * @returns {object|null}
   */
  getUserData() {
    try {
      const data = localStorage.getItem(USER_DATA_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error)
      return null
    }
  },

  /**
   * Eliminar datos del usuario
   */
  removeUserData() {
    try {
      localStorage.removeItem(USER_DATA_KEY)
    } catch (error) {
      console.error('Error eliminando datos del usuario:', error)
    }
  },

  /**
   * Limpiar todo el almacenamiento de autenticación
   */
  clearAuth() {
    this.removeAuthToken()
    this.removeUserData()
  },

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getAuthToken()
  },

  /**
   * Guardar rol del usuario
   * @param {string} role 
   */
  setUserRole(role) {
    try {
      // Guardar en localStorage
      localStorage.setItem('user_role', role)
      
  
      if (typeof document !== 'undefined') {
        document.cookie = `user_role=${role}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Strict`
      }
    } catch (error) {
      console.error('Error guardando rol:', error)
    }
  },

  /**
   * Obtener rol del usuario
   * @returns {string|null}
   */
  getUserRole() {
    try {
      return localStorage.getItem('user_role')
    } catch (error) {
      console.error('Error obteniendo rol:', error)
      return null
    }
  },

  /**
   * Eliminar rol del usuario
   */
  removeUserRole() {
    try {
      localStorage.removeItem('user_role')
      
      // También eliminar de cookies (solo en el navegador)
      if (typeof document !== 'undefined') {
        document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    } catch (error) {
      console.error('Error eliminando rol:', error)
    }
  }
}

/**
 * Función para decodificar JWT y extraer el rol (sin verificar firma)
 * Solo para extraer información, no para validación de seguridad
 */
export const extractRoleFromJWT = (token) => {
  try {
    if (!token) {
      console.warn('No se proporcionó token para extraer rol')
      return null
    }

    // Decodificar el payload del JWT (base64)
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.warn('Token JWT mal formado')
      return null
    }

    const payload = JSON.parse(atob(parts[1]))


    // Buscar el rol en diferentes posibles ubicaciones
    const role = payload.role || 
                 payload.user_role || 
                 payload.rol || 
                 payload.roles?.[0] || 
                 payload.authorities?.[0] ||
                 'usuario' // rol por defecto


    return role
  } catch (error) {
    console.error('Error decodificando JWT para extraer rol:', error)
    return null
  }
}

/**
 * Función para establecer el rol desde el token actual
 * Útil para re-sincronizar el rol desde el JWT
 */
export const setRoleFromCurrentToken = () => {
  try {
    const token = storage.getAuthToken()
    if (!token) {
      console.warn('No hay token disponible para extraer rol')
      return null
    }

    const role = extractRoleFromJWT(token)
    if (role) {
      storage.setUserRole(role)

      return role
    }

    return null
  } catch (error) {
    console.error('Error sincronizando rol desde token:', error)
    return null
  }
}
