'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Activity,
  BarChart3
} from "lucide-react";
import { 
  getDashboardStats,
  getRecentActivity,
  getUsers,
  getBookings,
  getCourts
} from '@/lib/server-actions';
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Cargar datos en paralelo
      const [statsResponse, activityResponse, usersResponse, bookingsResponse, courtsResponse] = 
        await Promise.allSettled([
          getDashboardStats(),
          getRecentActivity(),
          getUsers(),
          getBookings(),
          getCourts()
        ]);

      // Procesar estadísticas
      let dashboardStats = {};
      
      if (statsResponse.status === 'fulfilled') {
        dashboardStats = statsResponse.value;
      } else {
        // Fallback: calcular estadísticas desde datos obtenidos
        const users = usersResponse.status === 'fulfilled' ? usersResponse.value : [];
        const bookings = bookingsResponse.status === 'fulfilled' ? bookingsResponse.value : [];
        const courts = courtsResponse.status === 'fulfilled' ? courtsResponse.value : [];

        const today = new Date();
        const todayBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.fecha_inicio || booking.fecha_reserva);
          return bookingDate.toDateString() === today.toDateString();
        });

        // Calcular ingresos mensuales
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();
        const monthlyBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.fecha_inicio || booking.fecha_reserva);
          return bookingDate.getMonth() === thisMonth && bookingDate.getFullYear() === thisYear;
        });
        
        const monthlyRevenue = monthlyBookings.reduce((total, booking) => {
          return total + (parseFloat(booking.precio_total) || 0);
        }, 0);

        // Calcular tasa de ocupación
        const activeBookings = bookings.filter(b => b.estado === 'confirmada' && new Date(b.fecha_inicio || b.fecha_reserva) >= today);
        const occupancyRate = courts.length > 0 ? (activeBookings.length / courts.length) * 100 : 0;

        dashboardStats = {
          totalUsers: users.length,
          todayBookings: todayBookings.length,
          monthlyRevenue: monthlyRevenue,
          occupancyRate: Math.round(occupancyRate)
        };
      }

      setStats(dashboardStats);

      // Cargar actividad reciente
      if (activityResponse.status === 'fulfilled') {
        setRecentActivity(activityResponse.value);
      } else {
        // Fallback: crear actividad desde bookings recientes
        const bookings = bookingsResponse.status === 'fulfilled' ? bookingsResponse.value : [];
        const recentBookings = bookings
          .sort((a, b) => new Date(b.fecha_creacion || b.fecha_inicio) - new Date(a.fecha_creacion || a.fecha_inicio))
          .slice(0, 5)
          .map(booking => ({
            type: 'booking',
            title: `Reserva ${booking.estado}`,
            description: `Cancha ${booking.cancha_nombre || booking.cancha_id}`,
            time: 'Reciente',
            bookingId: booking.reserva_id
          }));
        
        setRecentActivity(recentBookings);
      }

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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
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
                    <Skeleton className="h-4 w-16" />
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Resumen general del sistema de reservas
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios registrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reservas Hoy
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              Reservas para hoy
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Mensuales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Mes actual
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ocupación
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Tasa de ocupación
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas actividades del sistema</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              )) : (
                <div className="text-center py-4">
                  <Activity className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground">No hay actividad reciente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Gestión del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild className="w-full justify-start">
              <a href="/admin/bookings">
                <Calendar className="mr-2 h-4 w-4" />
                Ver Todas las Reservas
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Gestión de Usuarios
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/admin/courts">
                <BarChart3 className="mr-2 h-4 w-4" />
                Gestión de Canchas
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
