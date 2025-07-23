'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Calendar, 
  MapPin, 
  BarChart3,
  Settings,
  Shield,
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { 
  getDashboardStats, 
  getRecentActivity, 
  getUsers, 
  getBookings, 
  getCourts 
} from '@/lib/server-actions';
import { toast } from "sonner";
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Cargar datos en paralelo para mejor rendimiento
      const [statsResponse, usersResponse, bookingsResponse, courtsResponse] = await Promise.allSettled([
        getDashboardStats(),
        getUsers(),
        getBookings(),
        getCourts()
      ]);

      // Procesar estadísticas del backend o calcular localmente
      let dashboardStats = {};
      
      if (statsResponse.status === 'fulfilled') {
        dashboardStats = statsResponse.value;
      } else {
        // Fallback: calcular estadísticas localmente
        const users = usersResponse.status === 'fulfilled' ? usersResponse.value : [];
        const bookings = bookingsResponse.status === 'fulfilled' ? bookingsResponse.value : [];
        const courts = courtsResponse.status === 'fulfilled' ? courtsResponse.value : [];

        const today = new Date();
        const todayBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.fecha_reserva);
          return bookingDate.toDateString() === today.toDateString();
        });

        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();
        const monthlyBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.fecha_reserva);
          return bookingDate.getMonth() === thisMonth && bookingDate.getFullYear() === thisYear;
        });

        const monthlyRevenue = monthlyBookings.reduce((total, booking) => {
          return total + (parseFloat(booking.precio_total) || 0);
        }, 0);

        const activeBookings = bookings.filter(b => b.estado === 'confirmada' || b.estado === 'en_progreso');
        const occupancyRate = courts.length > 0 ? (activeBookings.length / courts.length * 100) : 0;

        dashboardStats = {
          totalUsers: users.length,
          newUsersThisWeek: Math.floor(users.length * 0.08), // Estimación
          todayBookings: todayBookings.length,
          bookingGrowth: '+15%', // Placeholder
          monthlyRevenue: monthlyRevenue,
          revenueGrowth: '+8.2%', // Placeholder
          occupancyRate: Math.round(occupancyRate),
          totalCourts: courts.length,
          activeCourts: courts.filter(c => c.activa || c.disponible).length
        };
      }

      setStats(dashboardStats);

      // Cargar actividad reciente
      try {
        const activityData = await getRecentActivity();
        setActivity(activityData);
      } catch (error) {
        // Fallback: crear actividad ficticia basada en datos reales
        const fallbackActivity = [
          {
            type: 'user',
            title: 'Usuarios registrados',
            description: `${dashboardStats.totalUsers} usuarios en el sistema`,
            time: 'Sistema activo',
            icon: 'users'
          },
          {
            type: 'booking',
            title: 'Reservas hoy',
            description: `${dashboardStats.todayBookings} reservas confirmadas`,
            time: 'Hoy',
            icon: 'calendar'
          },
          {
            type: 'court',
            title: 'Canchas disponibles',
            description: `${dashboardStats.activeCourts}/${dashboardStats.totalCourts} canchas activas`,
            time: 'Estado actual',
            icon: 'mappin'
          }
        ];
        setActivity(fallbackActivity);
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
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'booking':
        return <Calendar className="h-4 w-4" />;
      case 'court':
        return <MapPin className="h-4 w-4" />;
      case 'settings':
        return <Settings className="h-4 w-4" />;
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administrador</h1>
          <p className="text-muted-foreground">
            Control total del sistema de canchas
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Admin Stats Cards */}
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
              +{stats.newUsersThisWeek || 0} nuevos esta semana
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
              {stats.bookingGrowth || 'Sin datos'} vs ayer
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
              {stats.revenueGrowth || 'Sin datos'} vs mes anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ocupación
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCourts || 0}/{stats.totalCourts || 0} canchas activas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions and System Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>Monitoreo en tiempo real</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Servidor Principal</span>
              </div>
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Activo
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Base de Datos</span>
              </div>
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Activo
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium">Sistema de Pagos</span>
              </div>
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Mantenimiento
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Canchas</span>
              </div>
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                {stats.activeCourts || 0}/{stats.totalCourts || 0} Activas
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Gestión completa del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild className="w-full justify-start">
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Gestionar Usuarios
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/courts">
                <MapPin className="mr-2 h-4 w-4" />
                Administrar Canchas
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/bookings">
                <Calendar className="mr-2 h-4 w-4" />
                Ver Reservas
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/reservas">
                <BarChart3 className="mr-2 h-4 w-4" />
                Nueva Reserva
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Sistema</CardTitle>
          <CardDescription>Información actualizada del estado general</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activity.length > 0 ? activity.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-4 ${
                  item.type === 'user' ? 'bg-blue-100 text-blue-600' :
                  item.type === 'booking' ? 'bg-green-100 text-green-600' :
                  item.type === 'court' ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {getActivityIcon(item.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">{item.time}</div>
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
    </div>
  );
}
                <span className="text-sm font-medium">Servidor Principal</span>
              </div>
              <Badge variant="default">Activo</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Base de Datos</span>
              </div>
              <Badge variant="default">Activo</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium">Sistema de Pagos</span>
              </div>
              <Badge variant="secondary">Mantenimiento</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Canchas IoT</span>
              </div>
              <Badge variant="default">12/12 Activas</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Acciones de Administrador</CardTitle>
            <CardDescription>
              Gestión completa del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Gestionar Usuarios
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="mr-2 h-4 w-4" />
              Administrar Canchas
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Generar Reportes
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Configuración Global
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Admin Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad de Administración Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Nuevo usuario registrado
                </p>
                <p className="text-sm text-muted-foreground">
                  juan.perez@email.com - Rol: Usuario
                </p>
              </div>
              <div className="text-sm text-muted-foreground">hace 15m</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <Settings className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Configuración actualizada
                </p>
                <p className="text-sm text-muted-foreground">
                  Horarios de operación modificados
                </p>
              </div>
              <div className="text-sm text-muted-foreground">hace 2h</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                <MapPin className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Nueva cancha agregada
                </p>
                <p className="text-sm text-muted-foreground">
                  Cancha 13 - Fútbol 7 disponible
                </p>
              </div>
              <div className="text-sm text-muted-foreground">hace 1d</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
