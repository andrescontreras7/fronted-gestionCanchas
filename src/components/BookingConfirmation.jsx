'use client';

import React, { useState } from 'react';
import { createSimpleBooking } from '@/lib/booking-actions';
import { formatTimeToAMPM } from '@/lib/time-utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function BookingConfirmation({ courtData, timeSlot, onConfirm, onCancel }) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirmBooking = async () => {
    setLoading(true);
    
    try {
      // Validar que la fecha y hora sean futuras
      const fechaHoraReserva = new Date(`${timeSlot.fecha}T${timeSlot.hora_inicio}`);
      const ahora = new Date();
      
      if (fechaHoraReserva <= ahora) {
        toast.error('Error en horario de reserva', {
          description: 'La hora de inicio debe ser igual o posterior a la hora actual. Selecciona un horario futuro.'
        });
        setLoading(false);
        return;
      }
      
      // Obtener datos del usuario
      const user = JSON.parse(localStorage.getItem('user_data') || '{}');
      
      const bookingData = {
        cancha_id: String(courtData.cancha_id || courtData.id),
        fecha_inicio: `${timeSlot.fecha}T${timeSlot.hora_inicio}`,
        fecha_fin: `${timeSlot.fecha}T${timeSlot.hora_fin}`,
        notas: notes.trim() || null,
        user_email: user.email,
        user_nombre: user.username,
        user_telefono: user.telefono || user.phone || "+000000000" // Usar teléfono del usuario o uno por defecto
        // NO incluir bloque_id porque el backend no lo espera
      };

      console.log('Datos de reserva:', bookingData);

      await createSimpleBooking(bookingData);
      
      toast.success('¡Reserva confirmada!', {
        description: `${courtData.nombre} - ${timeSlot.fecha} de ${formatTimeToAMPM(timeSlot.hora_inicio)} a ${formatTimeToAMPM(timeSlot.hora_fin)}`
      });
      
      onConfirm();
    } catch (error) {
      console.error('Error confirmando reserva:', error);
      toast.error('Error al confirmar reserva', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmar Reserva</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Detalles de la cancha */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{courtData.nombre}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{timeSlot.fecha}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">
              {formatTimeToAMPM(timeSlot.hora_inicio)} - {formatTimeToAMPM(timeSlot.hora_fin)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              ({timeSlot.hora_inicio} - {timeSlot.hora_fin})
            </span>
          </div>
          
          {courtData.ubicacion && (
            <div className="text-sm text-muted-foreground">
              📍 {courtData.ubicacion}
            </div>
          )}
        </div>

        {/* Notas */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Textarea
            id="notes"
            placeholder="Agrega cualquier comentario o requerimiento especial..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <Button 
            onClick={handleConfirmBooking}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Confirmar Reserva
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
