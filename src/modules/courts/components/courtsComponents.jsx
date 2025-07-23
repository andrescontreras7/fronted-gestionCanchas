import { ProtectedComponent } from "@/components/ProtectedComponent";
import { PERMISSIONS } from "@/lib/permissions";
import { deleteCourt } from "@/lib/booking-actions";
import Link from "next/link";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MapPin,
  Users,
  DollarSign,
  Clock,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

function CourtsComponents({ courts, role, onCourtDeleted }) {
  console.log("Courts data:", courts);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courtToDelete, setCourtToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteCourt = async () => {
    if (!courtToDelete) return;

    setDeleting(true);
    try {
      await deleteCourt(courtToDelete.cancha_id || courtToDelete.id);
      toast.success("Cancha eliminada exitosamente");
      setDeleteDialogOpen(false);
      setCourtToDelete(null);
      if (onCourtDeleted) {
        onCourtDeleted(courtToDelete.cancha_id || courtToDelete.id);
      }
    } catch (error) {
      console.error("Error eliminando cancha:", error);
      toast.error(`Error al eliminar cancha: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Canchas Disponibles</h1>
          <p className="text-muted-foreground">
            {role === "admin"
              ? "Gestiona las canchas del sistema"
              : "Selecciona una cancha para reservar"}
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

      {courts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court) => (
            <Card
              key={court.cancha_id || court.id}
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{court.nombre}</CardTitle>
                  <Badge variant={court.disponible ? "default" : "secondary"}>
                    {court.disponible ? "Disponible" : "No Disponible"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {court.descripcion && (
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {court.descripcion}
                  </p>
                )}

                <div className="space-y-2">
                  {court.tipo_deporte && (
                    <Badge variant="outline">{court.tipo_deporte}</Badge>
                  )}

                  {court.ubicacion && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{court.ubicacion}</span>
                    </div>
                  )}

                  {court.capacidad_jugadores && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{court.capacidad_jugadores} jugadores</span>
                    </div>
                  )}

                  {court.precio_por_hora && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>${court.precio_por_hora}/hora</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    {role === "admin" ? (
                      <Link
                        href={`/admin/courts/${court.cancha_id || court.id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full">
                          Ver Detalles
                        </Button>
                      </Link>
                    ) : (
                      <Link
                        href={`/user/courts/${court.cancha_id || court.id}`}
                        className="flex-1"
                      >
                        <Button className="w-full">Reservar</Button>
                      </Link>
                    )}

                    {role === "admin" && (
                      <>
                        <ProtectedComponent
                          permissions={PERMISSIONS.VER_CANCHAS}
                        >
                          <Link
                            href={`/admin/courts/${
                              court.cancha_id || court.id
                            }/horarios`}
                          >
                            <Button size="sm" variant="outline">
                              <Clock className="h-4 w-4" />
                            </Button>
                          </Link>
                        </ProtectedComponent>

                        <ProtectedComponent
                          permissions={PERMISSIONS.EDITAR_CANCHAS}
                        >
                          <Link
                            href={`/admin/courts/${
                              court.cancha_id || court.id
                            }/edit`}
                          >
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </ProtectedComponent>

                        <ProtectedComponent
                          permissions={PERMISSIONS.ELIMINAR_CANCHAS}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCourtToDelete(court);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </ProtectedComponent>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <div className="text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4" />
              </div>
              <div>
                <h3 className="text-lg font-medium">
                  No hay canchas disponibles
                </h3>
                <p className="text-muted-foreground">
                  {role === "admin"
                    ? "Comienza creando tu primera cancha."
                    : "No hay canchas disponibles para reservar en este momento."}
                </p>
              </div>
              {role === "admin" && (
                <ProtectedComponent permissions={PERMISSIONS.CREAR_CANCHAS}>
                  <Link href="/admin/courts/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primera Cancha
                    </Button>
                  </Link>
                </ProtectedComponent>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro que deseas eliminar la cancha{" "}
              <strong>{courtToDelete?.nombre}</strong>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Esta acción no se puede deshacer y eliminará todas las reservas
              asociadas.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCourt}
              disabled={deleting}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CourtsComponents;
