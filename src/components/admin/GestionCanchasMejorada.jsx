"use client";

import React, { useState, useEffect } from "react";
import {
  getCourtsWithStats,
  updateCourtStatus,
  checkCourtFullAvailability,
  deleteCourt,
} from "@/lib/booking-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Users,
  DollarSign,
  Clock,
  Plus,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  Wrench,
  Eye,
  Activity,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { PERMISSIONS } from "@/lib/permissions";
import Link from "next/link";

const ESTADOS_CANCHA = {
  activa: {
    label: "Activa",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  inactiva: {
    label: "Inactiva",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

const mapearEstadoCancha = (cancha) => {
  return cancha.disponible === true ? "activa" : "inactiva";
};

const obtenerConfigEstado = (cancha) => {
  const estado = mapearEstadoCancha(cancha);
  return ESTADOS_CANCHA[estado];
};

export default function GestionCanchasMejorada() {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCancha, setSelectedCancha] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [canchaToDelete, setCanchaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const loadCanchas = async () => {
    setLoading(true);
    try {
      const data = await getCourtsWithStats();

      const canchesWithAvailability = await Promise.all(
        data.map(async (cancha, index) => {
          try {
            const availability = await checkCourtFullAvailability(
              cancha.cancha_id
            );
            return {
              ...cancha,
              ...availability,
            };
          } catch (error) {
            console.error(` Error procesando cancha ${cancha.nombre}:`, error);
            return {
              ...cancha,
              tieneHorarios: false,
              tieneEspeciales: false,
              estadoGeneral: "error",
            };
          }
        })
      );

      console.log(
        " Canchas procesadas completamente:",
        canchesWithAvailability.length
      );
      setCanchas(canchesWithAvailability);
    } catch (error) {
      console.error(" Error cargando canchas:", error);
      toast.error(`Error al cargar canchas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCanchas();
  }, []);

  const handleStatusChange = async () => {
    if (!selectedCancha || !newStatus) {
      toast.error("Por favor selecciona un estado válido");
      return;
    }

    setUpdatingStatus(true);
    try {
      const result = await updateCourtStatus(
        selectedCancha.cancha_id,
        newStatus
      );

      const estadoAnterior = mapearEstadoCancha(selectedCancha);
      const estadoNuevo = newStatus;

      toast.success(
        ` Estado actualizado: "${estadoAnterior}" → "${
          newStatus === "activa" ? "Activa" : "Inactiva"
        }" para ${selectedCancha.nombre}`
      );

      setStatusDialogOpen(false);
      setSelectedCancha(null);
      setNewStatus("");

      // Recargar datos para reflejar cambios
      console.log("🔄 Recargando lista de canchas...");
      await loadCanchas();
    } catch (error) {
      console.error("❌ Error actualizando estado:", error);
      toast.error(
        `Error al actualizar estado: ${error.message || "Error desconocido"}`
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Eliminar cancha
  const handleDeleteCourt = async () => {
    if (!canchaToDelete) return;

    setDeleting(true);
    try {
      console.log("Eliminando cancha:", canchaToDelete.cancha_id);

      await deleteCourt(canchaToDelete.cancha_id);
      toast.success(`Cancha "${canchaToDelete.nombre}" eliminada exitosamente`);

      setDeleteDialogOpen(false);
      setCanchaToDelete(null);

      // Recargar datos
      loadCanchas();
    } catch (error) {
      toast.error(`❌ Error al eliminar cancha: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Determinar estado visual de la cancha (simplificado)
  const getCourtDisplayStatus = (cancha) => {
    console.log("🔍 Estado de cancha:", cancha.nombre, {
      disponible: cancha.disponible,
      tieneHorarios: cancha.tieneHorarios,
    });

    // Simplemente usar el campo disponible
    return cancha.disponible === true ? "activa" : "inactiva";
  };

  // Determinar nivel de configuración
  const getConfigLevel = (cancha) => {
    let level = 0;

    // Factores que determinan el nivel de configuración
    if (cancha.nombre && cancha.nombre.trim()) level += 20;
    if (cancha.descripcion && cancha.descripcion.trim()) level += 15;
    if (cancha.ubicacion && cancha.ubicacion.trim()) level += 15;
    if (cancha.precio_por_hora || cancha.precio_base) level += 15;
    if (cancha.disponible === true) level += 15; // Está activa
    if (cancha.tieneHorarios) level += 20;

    return Math.min(level, 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Cargando canchas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Gestión Avanzada de Canchas
          </h1>
          <p className="text-muted-foreground mt-2">
            Dashboard completo con estados, estadísticas y configuración
          </p>
        </div>

        <ProtectedComponent permissions={PERMISSIONS.CREAR_CANCHAS}>
          <Link href="/admin/courts/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Cancha
            </Button>
          </Link>
        </ProtectedComponent>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Activas</p>
                <p className="text-2xl font-bold">
                  {canchas.filter((c) => c.disponible === true).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Inactivas</p>
                <p className="text-2xl font-bold">
                  {canchas.filter((c) => c.disponible === false).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{canchas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {canchas.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {canchas.map((cancha) => {
            const displayStatus = getCourtDisplayStatus(cancha);
            const statusConfig = ESTADOS_CANCHA[displayStatus];
            const StatusIcon = statusConfig.icon;
            const configLevel = getConfigLevel(cancha);

            return (
              <Card
                key={cancha.cancha_id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {cancha.nombre}
                        <StatusIcon className="h-5 w-5" />
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                        {(cancha.tipo || cancha.tipo_deporte) && (
                          <Badge variant="outline">
                            {cancha.tipo || cancha.tipo_deporte}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Configuración
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${configLevel}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {configLevel}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Información básica */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {cancha.ubicacion && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{cancha.ubicacion}</span>
                      </div>
                    )}

                    {(cancha.precio_base || cancha.precio_por_hora) && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>
                          ${cancha.precio_base || cancha.precio_por_hora}/hora
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Estadísticas */}
                  <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {cancha.totalReservas || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Reservas
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {cancha.horasReservadas || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Horas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {cancha.ocupacionPromedio || 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Ocupación
                      </div>
                    </div>
                  </div>

                  {/* Estado de configuración */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Horarios Base:</span>
                      {cancha.tieneHorarios ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Días Especiales:</span>
                      {cancha.tieneEspeciales ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2 border-t">
                    <ProtectedComponent permissions={PERMISSIONS.VER_CANCHAS}>
                      <Link
                        href={`/admin/courts/${cancha.cancha_id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
                    </ProtectedComponent>

                    <ProtectedComponent
                      permissions={PERMISSIONS.EDITAR_CANCHAS}
                    >
                      <Link href={`/admin/courts/${cancha.cancha_id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Link>
                    </ProtectedComponent>

                    <ProtectedComponent
                      permissions={PERMISSIONS.EDITAR_CANCHAS}
                    >
                      <Link href={`/admin/courts/${cancha.cancha_id}/horarios`}>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </Link>
                    </ProtectedComponent>

                    <ProtectedComponent
                      permissions={PERMISSIONS.EDITAR_CANCHAS}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log(
                            "🎯 Abriendo diálogo para cancha:",
                            cancha.nombre,
                            cancha.cancha_id
                          );
                          setSelectedCancha(cancha);
                          setNewStatus(""); // Resetear estado
                          setStatusDialogOpen(true);
                        }}
                        title="Cambiar estado de la cancha"
                      >
                        <Activity className="h-4 w-4 mr-1" />
                        Estado
                      </Button>
                    </ProtectedComponent>

                    <ProtectedComponent
                      permissions={PERMISSIONS.ELIMINAR_CANCHAS}
                    >
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setCanchaToDelete(cancha);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </ProtectedComponent>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No hay canchas registradas
            </h3>
            <p className="text-muted-foreground mb-4">
              Comienza creando tu primera cancha para empezar a gestionar
              reservas.
            </p>
            <ProtectedComponent permissions={PERMISSIONS.CREAR_CANCHAS}>
              <Link href="/admin/courts/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Cancha
                </Button>
              </Link>
            </ProtectedComponent>
          </CardContent>
        </Card>
      )}

      {/* Dialog para cambiar estado */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Cancha</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <label className="text-sm font-medium text-muted-foreground">
                Cancha:
              </label>
              <p className="text-lg font-semibold">{selectedCancha?.nombre}</p>

              {selectedCancha && (
                <div className="mt-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Estado actual:
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      className={obtenerConfigEstado(selectedCancha).color}
                    >
                      {obtenerConfigEstado(selectedCancha).label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      (disponible: {selectedCancha.disponible ? "Sí" : "No"})
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Nuevo Estado:
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activa">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Activa
                    </div>
                  </SelectItem>
                  <SelectItem value="inactiva">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Inactiva
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus && newStatus !== mapearEstadoCancha(selectedCancha) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    La cancha cambiará de "{mapearEstadoCancha(selectedCancha)}"
                    a "{newStatus === "activa" ? "Activa" : "Inactiva"}"
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStatusDialogOpen(false);
                setNewStatus("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={
                !newStatus ||
                newStatus === mapearEstadoCancha(selectedCancha) ||
                updatingStatus
              }
            >
              {updatingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : !newStatus ? (
                "Selecciona un estado"
              ) : newStatus === mapearEstadoCancha(selectedCancha) ? (
                "Sin cambios"
              ) : (
                "Actualizar Estado"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800">¿Estás seguro?</h4>
                <p className="text-sm text-red-600">
                  Esta acción no se puede deshacer y eliminará permanentemente
                  la cancha.
                </p>
              </div>
            </div>

            {canchaToDelete && (
              <div>
                <label className="text-sm font-medium">
                  Cancha a eliminar:
                </label>
                <p className="text-lg font-bold">{canchaToDelete.nombre}</p>
                <p className="text-sm text-muted-foreground">
                  Tipo: {canchaToDelete.tipo || canchaToDelete.tipo_deporte} |
                  Ubicación: {canchaToDelete.ubicacion || "No especificada"}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setCanchaToDelete(null);
                }}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCourt}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar Cancha"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
