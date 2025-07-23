"use client";

import React, { useState, useEffect } from "react";
import { getDetailsBookingByUser } from "@/lib/server-actions";
import Link from "next/link";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterAndSortBookings();
  }, [bookings, searchTerm, statusFilter, sortBy]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await getDetailsBookingByUser();
      if (data && data.length > 0) {
      }
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      toast.error("Error al cargar las reservas");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortBookings = () => {
    let filtered = [...bookings];
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          (booking.cancha?.nombre || booking.cancha_nombre || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (booking.cancha?.ubicacion || booking.cancha_ubicacion || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.estado === statusFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.fecha_inicio) - new Date(b.fecha_inicio);
        case "date-desc":
          return new Date(b.fecha_inicio) - new Date(a.fecha_inicio);
        case "court-name":
          return (a.cancha?.nombre || a.cancha_nombre || "").localeCompare(
            b.cancha?.nombre || b.cancha_nombre || ""
          );
        case "status":
          return (a.estado || "").localeCompare(b.estado || "");
        default:
          return 0;
      }
    });

    setFilteredBookings(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmada":
        return "bg-green-100 text-green-700 border-green-200";
      case "pendiente":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelada":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const isUpcoming = (date) => {
    return new Date(date) > new Date();
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-48" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
   
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mis Reservas</h1>
          <p className="text-muted-foreground">
            Gestiona y revisa todas tus reservas
          </p>
        </div>
        <Link href="/user/courts">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Reserva
          </Button>
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cancha o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="confirmada">Confirmada</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Más recientes</SelectItem>
            <SelectItem value="date-asc">Más antiguos</SelectItem>
            <SelectItem value="court-name">Por cancha</SelectItem>
            <SelectItem value="status">Por estado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">Total reservas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter((b) => b.estado === "confirmada").length}
            </div>
            <p className="text-xs text-muted-foreground">Confirmadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {
                bookings.filter(
                  (b) => isUpcoming(b.fecha_inicio) && b.estado === "confirmada"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Próximas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter((b) => b.estado === "pendiente").length}
            </div>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de reservas */}
      {filteredBookings.length > 0 ? (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => {
            const dateTime = formatDateTime(booking.fecha_inicio);
            const endTime = formatDateTime(booking.fecha_fin);

            return (
              <Card
                key={booking.reserva_id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">
                          {booking.cancha?.nombre ||
                            booking.cancha_nombre ||
                            `Cancha ${
                              booking.cancha?.cancha_id ||
                              booking.cancha_id ||
                              "S/N"
                            }`}
                        </h3>
                        {isUpcoming(booking.fecha_inicio) &&
                          booking.estado === "confirmada" && (
                            <Badge
                              variant="outline"
                              className="text-blue-600 border-blue-200 bg-blue-50"
                            >
                              Próxima
                            </Badge>
                          )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{dateTime.date}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {dateTime.time} - {endTime.time}
                          </span>
                        </div>
                      </div>

                      {(booking.cancha?.ubicacion ||
                        booking.cancha_ubicacion) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {booking.cancha?.ubicacion ||
                              booking.cancha_ubicacion}
                          </span>
                        </div>
                      )}

                      {(booking.cancha?.tipo_deporte ||
                        booking.cancha_tipo_deporte) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">
                            {booking.cancha?.tipo_deporte ||
                              booking.cancha_tipo_deporte}
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-lg font-semibold">
                          {formatCurrency(booking.precio_total)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(booking.estado)}>
                            {booking.estado || "Confirmada"}
                          </Badge>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/user/bookings/${booking.reserva_id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalles
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-xl font-medium">
                  {bookings.length === 0
                    ? "No tienes reservas"
                    : "No se encontraron reservas"}
                </h3>
                <p className="text-muted-foreground">
                  {bookings.length === 0
                    ? "¡Haz tu primera reserva y disfruta de nuestras canchas!"
                    : "Prueba ajustando los filtros de búsqueda"}
                </p>
              </div>
              {bookings.length === 0 && (
                <Link href="/user/courts">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Reservar Ahora
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
