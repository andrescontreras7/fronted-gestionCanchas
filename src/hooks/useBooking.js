import { useState } from 'react';
import { createBooking } from '@/lib/server-actions';
import { toast } from 'sonner';

export function useBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createNewBooking = async (bookingData) => {
    setLoading(true);
    setError(null);
    
    try {

      if (!bookingData.cancha_id || !bookingData.dia || !bookingData.hora_inicio || !bookingData.hora_fin) {
        throw new Error('Todos los campos obligatorios deben estar completos');
      }

      if (!bookingData.disponibilidad_id) {
        throw new Error('Debe seleccionar un horario disponible');
      }

      const today = new Date();
      const diasSemana = {
        'lunes': 1,
        'martes': 2,
        'miercoles': 3,
        'jueves': 4,
        'viernes': 5,
        'sabado': 6,
        'domingo': 0
      };

      const diaSeleccionado = diasSemana[bookingData.dia.toLowerCase()];
      const fechaInicio = new Date(today);
      const diasHastaFecha = (diaSeleccionado + 7 - fechaInicio.getDay()) % 7;
      if (diasHastaFecha === 0 && fechaInicio.getDay() !== diaSeleccionado) {
        fechaInicio.setDate(fechaInicio.getDate() + 7);
      } else {
        fechaInicio.setDate(fechaInicio.getDate() + diasHastaFecha);
      }
      const fechaStr = fechaInicio.toISOString().split('T')[0]; // YYYY-MM-DD
      const dataToSend = {
        cancha_id: String(bookingData.cancha_id), // Convertir a string
        fecha_inicio: `${fechaStr}T${bookingData.hora_inicio}`,
        fecha_fin: `${fechaStr}T${bookingData.hora_fin}`, 
        disponibilidad_id: bookingData.disponibilidad_id,
        notas: bookingData.notas || null,
        user_email: bookingData.user_email,
        user_nombre: bookingData.user_nombre
      };
      // Mostrar toast de carga
      const loadingToast = toast.loading('Creando reserva...', {
        description: 'Por favor espera mientras procesamos tu solicitud'
      });

      const result = await createBooking(dataToSend);
      toast.dismiss(loadingToast);
      toast.success('¡Reserva creada exitosamente!', {
        description: `Reserva confirmada para ${bookingData.dia} de ${bookingData.hora_inicio} a ${bookingData.hora_fin}`,
        duration: 4000
      });
      
      return result;
    } catch (err) {
      console.error('Error detallado:', err);
      setError(err.message);
      toast.error('Error al crear la reserva', {
        description: err.message,
        duration: 5000
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createNewBooking,
    loading,
    error,
    clearError: () => setError(null)
  };
}
