'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDetailsCourts } from '@/lib/server-actions';
import CourtCalendar from '@/components/CourtCalendar';
import BookingConfirmation from '@/components/BookingConfirmation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, DollarSign, Users } from "lucide-react";
import Link from 'next/link';

export default function SimpleBookingFlow({ courtId }) {
  const router = useRouter();
  const [courtData, setCourtData] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const loadCourtData = async () => {
      try {
        const data = await getDetailsCourts(courtId);
        setCourtData(data);
      } catch (error) {
        console.error(' Error cargando cancha:', error);
      } finally {
        setLoading(false);
      }
    };

    if (courtId) {
      loadCourtData();
    }
  }, [courtId]);

  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleConfirmBooking = () => {
    router.push('/user/bookings');
  };

  const handleCancelBooking = () => {
    setSelectedTimeSlot(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/user/courts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Reservar Cancha</h1>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            Cargando información de la cancha...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!courtData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/user/courts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Error</h1>
            <p className="text-muted-foreground">No se pudo cargar la cancha</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
   
      <div className="flex items-center gap-4">
        <Link href="/user/courts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Reservar Cancha</h1>
          <p className="text-muted-foreground">
            {selectedTimeSlot ? 'Confirma tu reserva' : 'Selecciona fecha y horario'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Información de la Cancha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{courtData.nombre}</h3>
                {courtData.tipo_deporte && (
                  <Badge variant="secondary">{courtData.tipo_deporte}</Badge>
                )}
              </div>

              <div className="space-y-2">
                {courtData.ubicacion && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{courtData.ubicacion}</span>
                  </div>
                )}
                
                {courtData.precio_por_hora && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${courtData.precio_por_hora}/hora</span>
                  </div>
                )}
                
                {courtData.capacidad_jugadores && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Hasta {courtData.capacidad_jugadores} jugadores</span>
                  </div>
                )}
              </div>

              {courtData.descripcion && (
                <div>
                  <h4 className="font-medium mb-1">Descripción:</h4>
                  <p className="text-sm text-muted-foreground">
                    {courtData.descripcion}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <div className="flex items-center justify-center p-3 bg-muted rounded-lg">
                  <Badge variant={courtData.disponible ? 'default' : 'secondary'}>
                    {courtData.disponible ? 'Disponible' : 'No Disponible'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendario y confirmación */}
        <div className="lg:col-span-2">
          {!selectedTimeSlot ? (
            <CourtCalendar 
              canchaId={courtId} 
              onSelectTimeSlot={handleTimeSlotSelect}
            />
          ) : (
            <BookingConfirmation
              courtData={courtData}
              timeSlot={selectedTimeSlot}
              onConfirm={handleConfirmBooking}
              onCancel={handleCancelBooking}
            />
          )}
        </div>
      </div>
    </div>
  );
}
