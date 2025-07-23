
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'


// ===== FUNCIÓN BASE DE API =====

export async function apiCall(endpoint, options = {}) {
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
    

      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    return data
  } catch (error) {
     throw new Error(' API Error:', error)
    
  }
}


export async function authenticatedApiCall(endpoint, options = {}) {


  const token = localStorage.getItem('auth_token')

  if (!token) {
  
    throw new Error('No hay token de autenticación')
  }
  
  return apiCall(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })
}


export const usersAuthService = {
  async getAllUsers() {


    
    try {

      const response = await authenticatedApiCall('/admin/users/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      

      return response
    } catch (error) {
      console.error(' Error en:', error)
      throw error
    }
  },

  async getUserById(userId) {
    const response = await authenticatedApiCall(`/admin/users/${userId}`, {
      method: 'GET',
    })

    return response
  },

  async updateUser(userId, userData) {
    const response = await authenticatedApiCall(`/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    return response
  },

  async deactivateUser(userId) {
    const response = await authenticatedApiCall(`/admin/users/${userId}/deactivate`, {
      method: 'PUT',
    })

    return response
  },

  async activateUser(userId) {
    const response = await authenticatedApiCall(`/admin/users/${userId}/activate`, {
      method: 'PUT',
    })

    return response
  }
}



export async function authenticatedServerApiCall(endpoint, options = {}, cookieStore) {
  const token = cookieStore.get('auth_token')?.value

  
  if (!token) {

    return null
  }
  
  return apiCall(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })
}


export function handleApiError(error) {
  console.error(' Manejando error de API:', error)
  
  if (error.message.includes('401')) {
   
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      window.location.href = '/'
    }
    return 'Sesion expirada. Por favor, inicia sesión nuevamente.'
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



