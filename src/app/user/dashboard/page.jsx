'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  MapPin, 
  Clock,
  DollarSign,
  Activity
} from "lucide-react";
import { 
  getDetailsBookingByUser,
  getCourts
} from '@/lib/server-actions';
import { toast } from "sonner";
import Link from 'next/link';

export default function UserDashboard() {
  const [stats, setStats] = useState({});
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDashboardData();
  }, []);

  const loadUserDashboardData = async () => {
    setLoading(true);
    try {
      // Cargar datos del usuario
      const [bookingsResponse, courtsResponse] = await Promise.allSettled([
        getDetailsBookingByUser(),
        getCourts()
      ]);

      // Calcular estadísticas desde los datos obtenidos
      const bookings = bookingsResponse.status === 'fulfilled' ? bookingsResponse.value : [];
      const courts = courtsResponse.status === 'fulfilled' ? courtsResponse.value : [];

      const today = new Date();
      const activeBookings = bookings.filter(b => b.estado === 'confirmada' && new Date(b.fecha_inicio) >= today);
      
      // Encontrar próxima reserva
      const futureBookings = bookings
        .filter(b => new Date(b.fecha_inicio) >= today)
        .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
      
      const nextBooking = futureBookings[0];
      
      // Calcular gasto mensual
      const thisMonth = today.getMonth();
      const thisYear = today.getFullYear();
      const monthlyBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.fecha_inicio);
        return bookingDate.getMonth() === thisMonth && bookingDate.getFullYear() === thisYear;
      });
      
      const monthlySpent = monthlyBookings.reduce((total, booking) => {
        return total + (parseFloat(booking.precio_total) || 0);
      }, 0);

      // Canchas más utilizadas
      const courtUsage = {};
      bookings.forEach(booking => {
        const courtName = booking.cancha?.nombre || booking.cancha_nombre || 'Cancha desconocida';
        courtUsage[courtName] = (courtUsage[courtName] || 0) + 1;
      });
      
      const favoritesCourts = Object.entries(courtUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name]) => name);

      const userStats = {
        activeBookings: activeBookings.length,
        totalBookings: bookings.length,
        nextBooking: nextBooking ? {
          date: nextBooking.fecha_inicio,
          endDate: nextBooking.fecha_fin,
          court: nextBooking.cancha?.nombre || nextBooking.cancha_nombre,
          courtLocation: nextBooking.cancha?.ubicacion || nextBooking.cancha_ubicacion,
          id: nextBooking.reserva_id
        } : null,
        monthlySpent: monthlySpent,
        favoriteCourts: favoritesCourts
      };

      setStats(userStats);
      setUserBookings(bookings.slice(0, 5)); // Últimas 5 reservas

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount || 0);
  };

  const formatNextBooking = (nextBooking) => {
    if (!nextBooking) return 'Sin reservas';
    
    const bookingDate = new Date(nextBooking.date);
    const today = new Date();
    
    if (bookingDate.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (bookingDate.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString()) {
      return 'Mañana';
    } else {
      return bookingDate.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-9 w-9 rounded-full mr-4" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido de vuelta</h1>
          <p className="text-muted-foreground">
            Aquí tienes un resumen de tu actividad
          </p>
        </div>
        <Button onClick={loadUserDashboardData} variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reservas Activas
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalBookings || 0} reservas en total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próxima Reserva
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNextBooking(stats.nextBooking)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.nextBooking ? 
                `${new Date(stats.nextBooking.date).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})} - ${stats.nextBooking.court}` : 
                'No hay próximas reservas'
              }
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gasto Mensual
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlySpent)}</div>
            <p className="text-xs text-muted-foreground">
              Mes actual
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Canchas Favoritas
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favoriteCourts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.favoriteCourts?.slice(0, 2).join(', ') || 'Sin datos'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Mis Reservas Recientes</CardTitle>
            <CardDescription>Últimas actividades en tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              {userBookings.length > 0 ? userBookings.map((booking, index) => (
                <div key={booking.reserva_id || index} className="flex items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-4 ${
                    booking.estado === 'confirmada' ? 'bg-green-100 text-green-600' :
                    booking.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-600' :
                    booking.estado === 'cancelada' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {booking.cancha?.nombre || booking.cancha_nombre || 'Cancha'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.fecha_inicio).toLocaleDateString('es-ES')} - {new Date(booking.fecha_inicio).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}
                    </p>
                    {(booking.cancha?.ubicacion || booking.cancha_ubicacion) && (
                      <p className="text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {booking.cancha?.ubicacion || booking.cancha_ubicacion}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant={booking.estado === 'confirmada' ? 'default' : 'secondary'}>
                      {booking.estado}
                    </Badge>
                    <span className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(booking.precio_total)}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reservas</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comienza haciendo tu primera reserva
                  </p>
                  <Button asChild>
                    <Link href="/user/courts">
                      <Calendar className="mr-2 h-4 w-4" />
                      Ver Canchas Disponibles
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Realiza las acciones más comunes
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild className="w-full justify-start">
              <Link href="/user/courts">
                <Calendar className="mr-2 h-4 w-4" />
                Nueva Reserva
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/user/bookings">
                <Activity className="mr-2 h-4 w-4" />
                Mis Reservas
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/user/courts">
                <MapPin className="mr-2 h-4 w-4" />
                Ver Canchas
              </Link>
            </Button>
            {stats.nextBooking && (
              <Button asChild variant="secondary" className="w-full justify-start">
                <Link href={`/user/bookings/${stats.nextBooking.id}`}>
                  <Clock className="mr-2 h-4 w-4" />
                  Ver Próxima Reserva
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
