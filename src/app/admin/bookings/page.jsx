"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Clock,
  MapPin,
  User,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { PERMISSIONS } from "@/lib/permissions";
import { getBookings, getUsers, getCourts } from "@/lib/server-actions";
import Link from "next/link";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const loadBookings = async () => {
    setLoading(true);
    try {
      // Cargar datos en paralelo
      const [bookingsData, usersData, courtsData] = await Promise.allSettled([
        getBookings(),
        getUsers(),
        getCourts(),
      ]);

      const reservas =
        bookingsData.status === "fulfilled" ? bookingsData.value : [];
      const usuarios = usersData.status === "fulfilled" ? usersData.value : [];
      const canchas = courtsData.status === "fulfilled" ? courtsData.value : [];
      const usuariosMap = usuarios.reduce((map, user) => {
        map[user.user_id] =
          `${user.nombre} ${user.apellido}`.trim() ||
          user.email ||
          "Usuario desconocido";
        return map;
      }, {});

      const canchasMap = canchas.reduce((map, court) => {
        map[court.cancha_id] =
          court.nombre || `Cancha ${court.cancha_id?.slice(-8)}`;
        return map;
      }, {});

      const enrichedData = reservas.map((booking) => ({
        ...booking,
        // Mapear campos si es necesario
        fecha_reserva:
          booking.fecha_inicio?.split("T")[0] || booking.fecha_reserva,
        hora_inicio:
          booking.fecha_inicio?.split("T")[1]?.slice(0, 5) ||
          booking.hora_inicio,
        hora_fin:
          booking.fecha_fin?.split("T")[1]?.slice(0, 5) || booking.hora_fin,
        // Agregar nombres desde los mapas
        usuario_nombre: usuariosMap[booking.user_id] || "Usuario desconocido",
        cancha_nombre: canchasMap[booking.cancha_id] || "Cancha desconocida",
      }));

      setBookings(enrichedData);
    } catch (error) {
      console.error("Error cargando reservas:", error);
      toast.error("Error al cargar las reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Filtrar reservas
  const filteredBookings = bookings.filter((booking) => {
    const searchFields = [
      booking.usuario_nombre,
      booking.cancha_nombre,
      booking.user_id,
      booking.cancha_id,
      booking.reserva_id,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      searchTerm === "" || searchFields.includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.estado === statusFilter;

    const today = new Date();
    const bookingDate = new Date(booking.fecha_reserva || booking.fecha_inicio);
    let matchesDate = true;

    if (dateFilter === "today") {
      matchesDate = bookingDate.toDateString() === today.toDateString();
    } else if (dateFilter === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      matchesDate = bookingDate >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      matchesDate = bookingDate >= monthAgo;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmada: {
        variant: "default",
        text: "Confirmada",
        class: "bg-green-100 text-green-800",
      },
      pendiente: {
        variant: "secondary",
        text: "Pendiente",
        class: "bg-yellow-100 text-yellow-800",
      },
      cancelada: {
        variant: "destructive",
        text: "Cancelada",
        class: "bg-red-100 text-red-800",
      },
      completada: {
        variant: "outline",
        text: "Completada",
        class: "bg-blue-100 text-blue-800",
      },
    };

    const config = statusConfig[status] || statusConfig["pendiente"];
    return <Badge className={config.class}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const dateOnly = dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString;

    return new Date(dateOnly).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";

    if (timeString.includes("T")) {
      return timeString.split("T")[1]?.slice(0, 5) || "N/A";
    }
    return timeString.slice(0, 5);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedComponent permission={PERMISSIONS.VIEW_BOOKINGS}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Reservas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administra todas las reservas del sistema
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/admin/reservas">
                <Calendar className="h-4 w-4 mr-2" />
                Nueva Reserva
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Reservas
                  </p>
                  <p className="text-2xl font-bold">{bookings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Confirmadas
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {bookings.filter((b) => b.estado === "confirmada").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pendientes
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {bookings.filter((b) => b.estado === "pendiente").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Canceladas
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {bookings.filter((b) => b.estado === "cancelada").length}
                  </p>
                </div>
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por usuario o cancha..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="confirmada">Confirmada</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las fechas</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de reservas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reservas ({filteredBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Cancha</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.reserva_id}>
                      <TableCell className="font-medium">
                        <div
                          className="max-w-32 truncate"
                          title={booking.reserva_id}
                        >
                          #{booking.reserva_id.slice(-8)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div
                            className="max-w-32 truncate"
                            title={booking.usuario_nombre}
                          >
                            {booking.usuario_nombre || "Usuario desconocido"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div
                            className="max-w-32 truncate"
                            title={booking.cancha_nombre}
                          >
                            {booking.cancha_nombre || "Cancha desconocida"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(
                          booking.fecha_reserva || booking.fecha_inicio
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {formatTime(booking.fecha_inicio)} -{" "}
                          {formatTime(booking.fecha_fin)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.estado)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          {formatCurrency(booking.precio_total)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/admin/bookings/${booking.reserva_id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredBookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Calendar className="h-8 w-8 text-gray-400" />
                          <p className="text-gray-500">
                            {bookings.length === 0
                              ? "No hay reservas en el sistema"
                              : "No se encontraron reservas con los filtros aplicados"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedComponent>
  );
}
