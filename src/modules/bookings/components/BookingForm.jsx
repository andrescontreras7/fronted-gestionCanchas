import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign, Users, Loader2, AlertCircle } from "lucide-react";
import Link from 'next/link';
import { useBooking } from '@/hooks/useBooking';
import { getDetailsCourts, getCourts, getAvailabilityCourts } from '@/lib/server-actions';
import { toast } from "sonner";

const DIAS_ORDENADOS = [
  'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'
];

// Schema de validación con Zod actualizado
const bookingSchema = z.object({
  cancha_id: z.string().min(1, 'Debe seleccionar una cancha'),
  notas: z.string().optional()
});

export default function BookingForm({ preselectedCourtId = null }) {
  const router = useRouter();
  const { createNewBooking, loading, error, clearError } = useBooking();
  
  const [loadingData, setLoadingData] = useState(true);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [allCourts, setAllCourts] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      cancha_id: preselectedCourtId || '',
      notas: ''
    }
  });

  const watchedCourtId = watch('cancha_id');

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        if (preselectedCourtId) {
          const courtDetails = await getDetailsCourts(preselectedCourtId);
          setSelectedCourt(courtDetails);
          // Cargar disponibilidad automáticamente para cancha preseleccionada
          await loadCourtAvailability(preselectedCourtId);
        } else {
          const courts = await getCourts();
          setAllCourts(courts);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [preselectedCourtId]);

  // Cargar detalles de cancha cuando cambia la selección
  useEffect(() => {
    if (watchedCourtId && !preselectedCourtId) {
      const loadCourtDetails = async () => {
        try {
          const courtDetails = await getDetailsCourts(watchedCourtId);
          setSelectedCourt(courtDetails);
          await loadCourtAvailability(watchedCourtId);
        } catch (error) {
          console.error('Error cargando detalles de cancha:', error);
        }
      };

      loadCourtDetails();
    }
  }, [watchedCourtId, preselectedCourtId]);

  // Función para cargar disponibilidad de una cancha
  const loadCourtAvailability = async (courtId) => {
    setLoadingDisponibilidad(true);
    try {
      const availability = await getAvailabilityCourts(courtId);
      setDisponibilidad(availability || []);
      // Reset selections when loading new availability
      setDiaSeleccionado(null);
      setHorarioSeleccionado(null);
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
      setDisponibilidad([]);
    } finally {
      setLoadingDisponibilidad(false);
    }
  };

  const onSubmit = async (data) => {
    clearError();
    
    if (!horarioSeleccionado || !diaSeleccionado) {
      toast.error("Por favor selecciona un día y horario disponible");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user_data'));
      
      // Determinar el ID correcto de la cancha
      const courtId = selectedCourt?.cancha_id || selectedCourt?.id || data.cancha_id;
      
      console.log('Selected Court:', selectedCourt);
      console.log('Form data cancha_id:', data.cancha_id);
      console.log('Court ID to use:', courtId);
      
      const bookingData = {
        cancha_id: courtId,
        dia: diaSeleccionado,
        hora_inicio: horarioSeleccionado.hora_inicio,
        hora_fin: horarioSeleccionado.hora_fin,
        disponibilidad_id: horarioSeleccionado.disponibilidad_id,
        notas: data.notas?.trim() || null,
        user_email: user?.email,
        user_nombre: user?.username
      };

      await createNewBooking(bookingData);
      
      // Toast de éxito con diseño bonito
      toast.success("¡Reserva creada exitosamente!", {
        description: `${selectedCourt.nombre} - ${diaSeleccionado} de ${horarioSeleccionado.hora_inicio.slice(0, 5)} a ${horarioSeleccionado.hora_fin.slice(0, 5)}`,
        duration: 5000,
        position: "bottom-right"
      });
      
      router.push('/user/bookings');
    } catch (err) {
      toast.error("Error al crear la reserva", {
        description: err.message || "Ha ocurrido un error inesperado",
        duration: 5000,
        position: "bottom-right"
      });
      console.error('Error en el formulario:', err);
    }
  };

  // Organizar disponibilidad por días
  const dias = {};
  disponibilidad.forEach(item => {
    if (!dias[item.dia_semana]) dias[item.dia_semana] = [];
    dias[item.dia_semana].push(item);
  });

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/user/bookings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Nueva Reserva</h1>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Cargando información de canchas...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/user/bookings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nueva Reserva</h1>
          <p className="text-muted-foreground">
            {selectedCourt ? `Reservando: ${selectedCourt.nombre}` : 'Selecciona una cancha para reservar'}
          </p>
        </div>
      </div>

      {/* Error global */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Cancha</CardTitle>
              <CardDescription>
                Elige la cancha que deseas reservar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Selección de cancha */}
                {!preselectedCourtId && (
                  <div className="space-y-2">
                    <Label htmlFor="cancha_id">Cancha *</Label>
                    <select
                      id="cancha_id"
                      {...register('cancha_id')}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Selecciona una cancha</option>
                      {allCourts.map(court => (
                        <option key={court.cancha_id} value={court.cancha_id}>
                          {court.nombre} - ${court.precio_por_hora}/hora
                        </option>
                      ))}
                    </select>
                    {errors.cancha_id && (
                      <p className="text-red-500 text-sm">{errors.cancha_id.message}</p>
                    )}
                  </div>
                )}

                {/* Notas */}
                <div className="space-y-2">
                  <Label htmlFor="notas">Notas (Opcional)</Label>
                  <Textarea
                    id="notas"
                    placeholder="Notas adicionales para tu reserva..."
                    {...register('notas')}
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Disponibilidad */}
          {selectedCourt && (
            <Card>
              <CardHeader>
                <CardTitle>Seleccionar Día y Horario</CardTitle>
                <CardDescription>
                  Elige cuándo quieres usar la cancha
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingDisponibilidad ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <span>Cargando disponibilidad...</span>
                  </div>
                ) : !disponibilidad.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay horarios disponibles para esta cancha.
                  </div>
                ) : (
                  <>
                    {/* Selector de días */}
                    <div>
                      <Label className="text-base font-medium mb-3 block">Seleccionar Día</Label>
                      <ScrollArea className="w-full">
                        <div className="flex gap-2 px-1 pb-2">
                          {DIAS_ORDENADOS.map(dia => (
                            <Button
                              key={dia}
                              type="button"
                              variant={diaSeleccionado === dia ? "default" : "outline"}
                              className={`capitalize px-3 py-2 font-semibold min-w-[100px] whitespace-nowrap ${
                                !dias[dia] ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              disabled={!dias[dia]}
                              onClick={() => {
                                setDiaSeleccionado(dia);
                                setHorarioSeleccionado(null); // Reset horario al cambiar día
                              }}
                            >
                              {dia}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Horarios por día */}
                    {diaSeleccionado && dias[diaSeleccionado] ? (
                      <div>
                        <Label className="text-base font-medium mb-3 block">
                          Horarios Disponibles - {diaSeleccionado}
                        </Label>
                        <ScrollArea className="h-[300px] pr-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {dias[diaSeleccionado].map(slot => (
                              <Button
                                key={slot.disponibilidad_id}
                                type="button"
                                variant={horarioSeleccionado?.disponibilidad_id === slot.disponibilidad_id ? "default" : "ghost"}
                                className={`flex flex-col items-center justify-center p-3 h-24 ${
                                  slot.estado === 'disponible' ? 'hover:bg-primary/10 border-2 border-dashed border-gray-300' : 'opacity-60'
                                }`}
                                disabled={slot.estado !== 'disponible'}
                                onClick={() => setHorarioSeleccionado(slot.estado === 'disponible' ? slot : null)}
                              >
                                <span className="font-mono font-bold text-base">{slot.hora_inicio.slice(0, 5)}</span>
                                <span className="font-mono text-xs">{slot.hora_fin.slice(0, 5)}</span>
                                <Badge
                                  variant={slot.estado === 'disponible' ? "secondary" : "destructive"}
                                  className="mt-1 text-xs"
                                >
                                  {slot.estado === 'disponible' ? 'Disponible' : 'Ocupado'}
                                </Badge>
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    ) : diaSeleccionado ? (
                      <div className="text-center text-muted-foreground py-4">
                        No hay horarios disponibles para {diaSeleccionado}.
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        Selecciona un día para ver los horarios disponibles.
                      </div>
                    )}

                    {/* Resumen de selección */}
                    {horarioSeleccionado && diaSeleccionado && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-blue-900">Resumen de tu Reserva</h3>
                            <div className="grid gap-2">
                              <div className="flex justify-between">
                                <span className="text-blue-700">Día:</span>
                                <Badge variant="outline" className="capitalize text-blue-800 border-blue-300">
                                  {diaSeleccionado}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-700">Horario:</span>
                                <Badge variant="outline" className="text-blue-800 border-blue-300">
                                  {horarioSeleccionado.hora_inicio.slice(0, 5)} - {horarioSeleccionado.hora_fin.slice(0, 5)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Botones de acción */}
          {selectedCourt && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading || !horarioSeleccionado || !diaSeleccionado} 
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creando Reserva...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Confirmar Reserva
                      </>
                    )}
                  </Button>
                  <Link href="/user/bookings">
                    <Button variant="outline" disabled={loading}>
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel de información de la cancha */}
        {selectedCourt && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Cancha Seleccionada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedCourt.nombre}</h3>
                  <p className="text-muted-foreground">{selectedCourt.tipo_deporte}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCourt.ubicacion}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Capacidad: {selectedCourt.capacidad_jugadores} jugadores</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${selectedCourt.precio_por_hora?.toLocaleString('es-CL')}/hora</span>
                  </div>
                </div>

                <div className="flex items-center justify-center p-3 bg-muted rounded-lg">
                  <Badge variant={selectedCourt.disponible ? 'default' : 'secondary'}>
                    {selectedCourt.disponible ? 'Disponible' : 'No Disponible'}
                  </Badge>
                </div>

                {selectedCourt.descripcion && (
                  <div>
                    <h4 className="font-medium mb-1">Descripción:</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedCourt.descripcion}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
