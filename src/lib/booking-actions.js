"use server";

import { cookies } from "next/headers";

// Obtener calendario del mes (días disponibles/no disponibles)
export async function getCourtCalendar(canchaId, year, month) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/${canchaId}/calendario?year=${year}&month=${month}`;

    console.log('🔗 Llamando endpoint calendario:', url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al obtener calendario: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // El backend devuelve un objeto con estructura: { cancha_id, año, mes, calendario: {...} }
    if (data && data.calendario && typeof data.calendario === 'object') {
      // Convertir el objeto calendario a array de días
      const calendarArray = Object.entries(data.calendario).map(([fecha, diaInfo]) => ({
        fecha: fecha,
        dia: new Date(fecha).getDate(),
        dia_semana: new Date(fecha).getDay(), // 0 = domingo, 1 = lunes, etc.
        disponible: diaInfo.total_disponibles > 0,
        es_hoy: fecha === new Date().toISOString().split('T')[0],
        tiene_bloques: diaInfo.total_disponibles > 0,
        total_disponibles: diaInfo.total_disponibles,
        total_ocupados: diaInfo.total_ocupados,
        bloques_disponibles: diaInfo.bloques_disponibles || [],
        bloques_ocupados: diaInfo.bloques_ocupados || [],
        // Metadatos adicionales
        dia_semana_nombre: diaInfo.dia_semana,
        year: data.año || year,
        month: data.mes || month
      }));
      
      console.log('✅ Calendario procesado:', calendarArray.length, 'días con', 
        calendarArray.filter(d => d.disponible).length, 'días disponibles');
      
      return calendarArray;
    }
    
    // Fallbacks para otros formatos
    if (Array.isArray(data)) {
      console.log('✅ Calendario ya es array:', data.length, 'días');
      return data;
    } else if (data && typeof data === 'object') {
      // Si es un objeto, verificar si tiene una propiedad que contenga el array
      if (data.calendar && Array.isArray(data.calendar)) {
        console.log('✅ Días en data.calendar:', data.calendar.length);
        return data.calendar;
      } else if (data.data && Array.isArray(data.data)) {
        console.log('✅ Días en data.data:', data.data.length);
        return data.data;
      } else if (data.days && Array.isArray(data.days)) {
        console.log('✅ Días en data.days:', data.days.length);
        return data.days;
      }
    }
    
    console.warn("⚠️ Formato de calendario inesperado:", data);
    return [];
  } catch (error) {
    console.error("❌ Error obteniendo calendario:", error);
    return [];
  }
}

// Obtener bloques disponibles para una fecha específica
export async function getAvailableBlocks(canchaId, fecha) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/${canchaId}/bloques-disponibles/${fecha}`;

    console.log('🔗 Llamando endpoint bloques:', url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al obtener bloques: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // El backend FastAPI devuelve: { cancha_id, fecha, bloques_disponibles: [...], total_disponibles }
    if (data && data.bloques_disponibles && Array.isArray(data.bloques_disponibles)) {
      return data.bloques_disponibles;
    }
    
    // Fallback si viene como array directo
    if (Array.isArray(data)) {
      return data;
    }
    
    console.warn("⚠️ Formato de bloques inesperado:", data);
    return [];
  } catch (error) {
    console.error("❌ Error obteniendo bloques:", error);
    return [];
  }
}

// Crear reserva simple
export async function createSimpleBooking(bookingData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticacion disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/reservas/create`;

   
    const normalizedBookingData = {
      cancha_id: bookingData.cancha_id,
      user_email: bookingData.user_email,
      user_nombre: bookingData.user_nombre,
      user_telefono: bookingData.user_telefono || "32225772361 pa", 
      fecha_inicio: bookingData.fecha_inicio,
      fecha_fin: bookingData.fecha_fin,
      notas: bookingData.notas
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(normalizedBookingData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const firstError = errorData.detail[0];
          if (firstError.msg) {
            throw new Error(firstError.msg);
          }
        } else if (errorData.detail && typeof errorData.detail === 'string') {
          throw new Error(errorData.detail);
        }
      } catch (parseError) {

      }
      
      throw new Error(`Error al crear reserva: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error creando reserva:", error);
    throw error;
  }
}


export async function setupCourtAvailability(canchaId, tipoHorario = 'completo') {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/disponibilidad/cancha/${canchaId}/setup-completo?tipo_horario=${tipoHorario}`;

    console.log('🔗 Setup disponibilidad:', { url, tipoHorario });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en setup: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error en setup de disponibilidad:", error);
    throw error;
  }
}


export async function getCourtAvailability(canchaId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/disponibilidad/cancha/${canchaId}`;

    console.log('🔗 Verificando disponibilidad para cancha:', canchaId, 'URL:', url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('📡 Respuesta disponibilidad status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error respuesta disponibilidad:', response.status, errorText);
      throw new Error(`Error al obtener disponibilidad: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 Data cruda disponibilidad cancha', canchaId, ':', data);
    
    // Asegurar que devolvamos un array
    if (Array.isArray(data)) {
      console.log('✅ Bloques encontrados:', data.length, 'bloques para cancha', canchaId);
      return data;
    } else if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) {
      console.log('✅ Bloques encontrados en data.data:', data.data.length, 'bloques para cancha', canchaId);
      return data.data;
    }
    
    console.warn('⚠️ No se encontraron bloques para cancha', canchaId, '- Estructura de respuesta:', data);
    return [];
  } catch (error) {
    console.error("❌ Error obteniendo disponibilidad cancha", canchaId, ":", error);
    return [];
  }
}

// Crear bloque de disponibilidad
export async function createAvailabilityBlock(blockData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/disponibilidad/create`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(blockData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error creando bloque: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error creando bloque:", error);
    throw error;
  }
}

// Actualizar bloque de disponibilidad
export async function updateAvailabilityBlock(disponibilidadId, blockData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/disponibilidad/${disponibilidadId}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(blockData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error actualizando bloque: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error actualizando bloque:", error);
    throw error;
  }
}


export async function deleteAvailabilityBlock(disponibilidadId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/disponibilidad/${disponibilidadId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error eliminando bloque: ${response.statusText} - ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error eliminando bloque:", error);
    throw error;
  }
}


export async function createSpecialDay(specialDayData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/dias-especiales/create`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(specialDayData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error creando día especial: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error creando día especial:", error);
    throw error;
  }
}

export async function getCourtSpecialDays(canchaId, fechaDesde, fechaHasta) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    let url = `${API_BASE_URL}/canchas/dias-especiales/cancha/${canchaId}`;
    
    if (fechaDesde && fechaHasta) {
      url += `?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo días especiales: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error obteniendo días especiales:", error);
    return [];
  }
}

// Crear período de mantenimiento
export async function createMaintenancePeriod(canchaId, fechaInicio, fechaFin, descripcion) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/dias-especiales/cancha/${canchaId}/mantenimiento`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cancha_id: canchaId,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        descripcion: descripcion
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error creando mantenimiento: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error creando mantenimiento:", error);
    throw error;
  }
}

// Setup automático de feriados del año
export async function setupYearHolidays(canchaId, year) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/dias-especiales/cancha/${canchaId}/feriados/${year}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify([]), // El backend espera una lista vacía
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error configurando feriados: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error configurando feriados:", error);
    throw error;
  }
}

// Actualizar día especial
export async function updateSpecialDay(diaEspecialId, updateData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/dias-especiales/${diaEspecialId}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error actualizando día especial: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error actualizando día especial:", error);
    throw error;
  }
}

// Eliminar día especial
export async function deleteSpecialDay(diaEspecialId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/dias-especiales/${diaEspecialId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error eliminando día especial: ${response.statusText} - ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error eliminando día especial:", error);
    throw error;
  }
}

// === GESTIÓN MEJORADA DE CANCHAS (ADMIN) ===

// Crear nueva cancha
export async function createCourt(courtData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/create`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(courtData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error creando cancha: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error creando cancha:", error);
    throw error;
  }
}

// Obtener estadísticas de una cancha (simulado hasta que tengamos el endpoint)
export async function getCourtStats(canchaId) {
  try {
    // Por ahora devolvemos estadísticas por defecto
    console.log(`Obteniendo stats para cancha ${canchaId}`);
    
    return {
      totalReservas: Math.floor(Math.random() * 50),
      horasReservadas: Math.floor(Math.random() * 200),
      ingresosTotales: Math.floor(Math.random() * 5000),
      ocupacionPromedio: Math.floor(Math.random() * 80),
      estadoActual: 'activa'
    };
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return {
      totalReservas: 0,
      horasReservadas: 0,
      ingresosTotales: 0,
      ocupacionPromedio: 0,
      estadoActual: 'desconocido'
    };
  }
}



// Eliminar cancha usando DELETE /canchas/{id}
export async function deleteCourt(canchaId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/${canchaId}`;

    console.log('🗑️ Eliminando cancha:', canchaId);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error eliminando cancha: ${response.statusText} - ${errorText}`);
    }

    // DELETE puede no retornar contenido
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      return { success: true };
    }
  } catch (error) {
    console.error("Error eliminando cancha:", error);
    throw error;
  }
}

// Actualizar estado de cancha usando PUT /canchas/{id}
export async function updateCourtStatus(canchaId, nuevoEstado, motivo = null) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    // Primero obtenemos los datos actuales de la cancha
    const currentCourt = await getCourtById(canchaId);
    
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/${canchaId}`;

    // Mapear el nuevo estado a disponible (booleano) - SIMPLIFICADO
    const disponible = nuevoEstado === 'activa';

    // Preparar datos actualizados manteniendo todos los campos requeridos
    const updateData = {
      nombre: currentCourt.nombre,
      descripcion: currentCourt.descripcion || "",
      tipo_deporte: currentCourt.tipo_deporte,
      capacidad_jugadores: currentCourt.capacidad_jugadores || 0,
      precio_por_hora: currentCourt.precio_por_hora || 0,
      disponible: disponible, // ← Campo clave: true = activa, false = inactiva
      ubicacion: currentCourt.ubicacion || "",
      imagen_url: currentCourt.imagen_url || ""
    };

    console.log('🔄 Actualizando estado de cancha:', {
      canchaId,
      nombre: currentCourt.nombre,
      estadoAnterior: currentCourt.disponible,
      nuevoEstado,
      disponibleNuevo: disponible
    });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Error actualizando estado: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Estado de cancha actualizado exitosamente:', {
      nombre: result.nombre,
      disponible: result.disponible,
      actualizado: new Date(result.fecha_actualizacion).toLocaleString()
    });
    
    return result;
  } catch (error) {
    console.error("❌ Error actualizando estado de cancha:", error);
    throw error;
  }
}

// Obtener resumen de todas las canchas para admin
export async function getCourtsWithStats() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    // Usar el nuevo endpoint específico para administradores que devuelve TODAS las canchas
    const url = `${API_BASE_URL}/canchas/admin/todas`;

    console.log('🔗 Obteniendo todas las canchas (admin) desde:', url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo canchas: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📦 Datos de canchas recibidos (admin):', data);
    
    // Asegurar que devolvamos un array y normalizar los datos
    if (Array.isArray(data)) {
      return data.map((cancha, index) => ({
        // IDs compatibles
        cancha_id: cancha.cancha_id || cancha.id || `temp-${index}`,
        id: cancha.id || cancha.cancha_id,
        
        // Datos básicos - mapear desde los nombres que usa el backend
        nombre: cancha.nombre || `Cancha ${index + 1}`,
        descripcion: cancha.descripcion || '',
        ubicacion: cancha.ubicacion || '',
        tipo: cancha.tipo_deporte || cancha.tipo || 'multideporte',  // Backend usa 'tipo_deporte'
        tipo_deporte: cancha.tipo_deporte || cancha.tipo || 'multideporte',
        precio_base: cancha.precio_por_hora || cancha.precio_base || 0,  // Backend usa 'precio_por_hora'
        precio_por_hora: cancha.precio_por_hora || cancha.precio_base || 0,
        capacidad_jugadores: cancha.capacidad_jugadores || null,
        estado: cancha.estado || 'activa',
        disponible: cancha.disponible !== undefined ? cancha.disponible : true,
        
        // Stats por defecto (hasta que tengamos endpoints reales)
        totalReservas: cancha.totalReservas || Math.floor(Math.random() * 50),
        horasReservadas: cancha.horasReservadas || Math.floor(Math.random() * 200),
        ingresosTotales: cancha.ingresosTotales || Math.floor(Math.random() * 5000),
        ocupacionPromedio: cancha.ocupacionPromedio || Math.floor(Math.random() * 80)
      }));
    }
    
    console.warn('Formato de respuesta inesperado:', data);
    return [];
  } catch (error) {
    console.error("Error obteniendo resumen de canchas:", error);
    return [];
  }
}

// Función simple para obtener todas las canchas (fallback)
export async function getAllCourts() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    // Usar el endpoint básico que devuelve solo canchas disponibles para usuarios regulares
    const url = `${API_BASE_URL}/canchas/`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo canchas: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error obteniendo canchas:", error);
    return [];
  }
}

// Obtener canchas disponibles específicamente
export async function getAvailableCourts() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    // Usar el endpoint específico para canchas disponibles
    const url = `${API_BASE_URL}/canchas/disponibles`;

    console.log('🔗 Obteniendo canchas disponibles desde:', url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo canchas disponibles: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📦 Canchas disponibles recibidas:', data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error obteniendo canchas disponibles:", error);
    return [];
  }
}

// Obtener canchas por tipo de deporte
export async function getCourtsByType(tipoDeporte, incluirNoDisponibles = false) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    let url = `${API_BASE_URL}/canchas/tipo/${tipoDeporte}`;
    
    // Solo agregar el parámetro si es admin y quiere incluir no disponibles
    if (incluirNoDisponibles) {
      url += '?incluir_no_disponibles=true';
    }

    console.log('🔗 Obteniendo canchas por tipo:', url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo canchas por tipo: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📦 Canchas por tipo recibidas:', data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error obteniendo canchas por tipo:", error);
    return [];
  }
}

// Verificar disponibilidad completa de cancha
export async function checkCourtFullAvailability(canchaId) {
  try {
    // Por ahora, vamos a hacer una verificación básica usando las funciones que sí funcionan
    const horarios = await getCourtAvailability(canchaId);
    const tieneHorarios = horarios && horarios.length > 0;
    
    // Para días especiales, haremos una verificación simple
    let tieneEspeciales = false;
    try {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      const especiales = await getCourtSpecialDays(
        canchaId, 
        today.toISOString().split('T')[0],
        nextMonth.toISOString().split('T')[0]
      );
      tieneEspeciales = especiales && especiales.length > 0;
    } catch (error) {
      console.warn("No se pudieron verificar días especiales:", error);
    }

    return {
      tieneHorarios,
      tieneEspeciales,
      estadoGeneral: tieneHorarios ? 'configurado' : 'configuracion-incompleta'
    };
  } catch (error) {
    console.error("Error verificando disponibilidad completa:", error);
    return {
      tieneHorarios: false,
      tieneEspeciales: false,
      estadoGeneral: 'configuracion-incompleta'
    };
  }
}

// Actualizar cancha completa usando PUT /canchas/{id}
export async function updateCourt(canchaId, courtData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/${canchaId}`;

    // Normalizar datos para el backend
    const normalizedData = {
      nombre: courtData.nombre,
      descripcion: courtData.descripcion || "",
      tipo_deporte: courtData.tipo_deporte || courtData.tipo,
      ubicacion: courtData.ubicacion || "",
      capacidad_jugadores: parseInt(courtData.capacidad_jugadores) || 0,
      precio_por_hora: parseFloat(courtData.precio_por_hora || courtData.precio_base) || 0,
      disponible: courtData.disponible !== undefined ? courtData.disponible : true,
      estado: courtData.estado || "activa"
    };

    console.log('🔄 Actualizando cancha:', canchaId, normalizedData);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(normalizedData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en respuesta:', response.status, errorText);
      throw new Error(`Error actualizando cancha: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Cancha actualizada:', result);
    return result;
  } catch (error) {
    console.error("❌ Error actualizando cancha:", error);
    throw error;
  }
}


// Obtener una cancha específica por ID usando GET /canchas/{id}
export async function getCourtById(canchaId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/canchas/${canchaId}`;

    console.log('🔍 Obteniendo cancha:', canchaId);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(' Error en respuesta:', response.status, errorText);
      throw new Error(`Error obteniendo cancha: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Cancha obtenida:', result);
    
    // Normalizar datos para consistencia con el frontend
    if (result) {
      return {
        ...result,
        tipo: result.tipo_deporte || result.tipo,
        precio_base: result.precio_por_hora || result.precio_base
      };
    }
    
    return result;
  } catch (error) {
    console.error("❌ Error obteniendo cancha:", error);
    throw error;
  }
}
