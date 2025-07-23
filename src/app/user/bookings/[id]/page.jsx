'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookingActionsCard } from "@/components/BookingActionsCard";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Mail, 
  DollarSign, 
  FileText, 
  ArrowLeft,
  Phone,
  Building,
  Activity,
  Loader2
} from "lucide-react";
import Link from 'next/link';
import { toast } from "sonner";
import { getDetailsBooking } from '@/lib/server-actions';

const BookingDetailPage = ({ params }) => {
  const [bookingDetails, setBookingDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    const loadBookingDetails = async () => {
      if (!resolvedParams?.id) return;
      
      setLoading(true);
      try {
        const details = await getDetailsBooking(resolvedParams.id);
        setBookingDetails(details);
      } catch (error) {
        console.error('Error fetching booking details:', error);
        toast.error('Error al cargar los detalles de la reserva');
      } finally {
        setLoading(false);
      }
    };

    loadBookingDetails();
  }, [resolvedParams]);

  const { 
    reserva_id, 
    fecha_inicio, 
    fecha_fin, 
    precio_total, 
    estado, 
    notas, 
    fecha_creacion, 
    fecha_actualizacion, 
    usuario = {}, 
    cancha = {} 
  } = bookingDetails;

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pendiente': { variant: 'secondary', text: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      'confirmada': { variant: 'default', text: 'Confirmada', className: 'bg-blue-100 text-blue-800' },
      'en_progreso': { variant: 'outline', text: 'En Progreso', className: 'bg-green-100 text-green-800' },
      'completada': { variant: 'success', text: 'Completada', className: 'bg-green-100 text-green-800' },
      'cancelada': { variant: 'destructive', text: 'Cancelada', className: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status] || statusConfig['pendiente'];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header con botón de regreso */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/user/bookings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Mis Reservas
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Mi Reserva</h1>
            <p className="text-muted-foreground">Reserva #{reserva_id}</p>
          </div>
        </div>
        {estado && getStatusBadge(estado)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información de la Reserva */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Detalles de tu Reserva
              </CardTitle>
              <CardDescription>
                Información completa de tu reserva de cancha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Fecha y Hora de Inicio
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatDateTime(fecha_inicio)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Fecha y Hora de Fin
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatDateTime(fecha_fin)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Precio Total
                  </label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xl font-bold text-green-600">
                      ${precio_total?.toLocaleString('es-CL') || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Estado de la Reserva
                  </label>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    {getStatusBadge(estado)}
                  </div>
                </div>
              </div>

              {notas && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notas Adicionales
                    </label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{notas}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Información de la Cancha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Información de la Cancha
              </CardTitle>
              <CardDescription>
                Detalles de la cancha reservada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Nombre de la Cancha
                  </label>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-lg">{cancha.nombre || 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Tipo de Deporte
                  </label>
                  <Badge variant="outline" className="w-fit">
                    {cancha.tipo_deporte || 'N/A'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Ubicación
                  </label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{cancha.ubicacion || 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Precio por Hora
                  </label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      ${cancha.precio_por_hora?.toLocaleString('es-CL') || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Información de fechas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información de Reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Fecha de Creación
                </label>
                <p className="text-sm">{formatDate(fecha_creacion)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Última Actualización
                </label>
                <p className="text-sm">
                  {fecha_actualizacion ? formatDate(fecha_actualizacion) : 'Sin actualizaciones'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  ID de Reserva
                </label>
                <p className="text-sm text-muted-foreground font-mono">#{reserva_id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Estado y acciones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acciones Disponibles</CardTitle>
              <CardDescription>
                Gestiona tu reserva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingActionsCard 
                booking={bookingDetails} 
                userRole="usuario" 
              />
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">¿Necesitas ayuda?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Si tienes alguna consulta sobre tu reserva, no dudes en contactarnos.
              </p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Contactar Soporte
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar Ahora
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
