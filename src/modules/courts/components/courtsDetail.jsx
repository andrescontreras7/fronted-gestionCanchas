import {
  ProtectedButton,
  ProtectedComponent,
} from "@/components/ProtectedComponent";
import { PERMISSIONS } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DisponibilidadCancha from "./avaibleCourtsComponents";
import {
  MapPin,
  Users,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import React, { memo } from "react";

const CourtsDetail = memo(
  ({
    courtsDetail,
    role,
    loading = false,
    onReservar,
    onEditar,
    onEliminar,
    onToggleDisponibilidad,
  }) => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{courtsDetail.nombre}</h1>
            <p className="text-muted-foreground">{courtsDetail.tipo_deporte}</p>
          </div>
          <Badge variant={courtsDetail.disponible ? "default" : "secondary"}>
            {courtsDetail.disponible ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Disponible
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                No Disponible
              </>
            )}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Canchas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{courtsDetail.ubicacion}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Capacidad: {courtsDetail.capacidad_jugadores} jugadores
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    ${courtsDetail.precio_por_hora?.toLocaleString("es-CL")}
                    /hora
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">ID:</span>
                  <span className="text-sm ml-2">{courtsDetail.cancha_id}</span>
                </div>

                {courtsDetail.descripcion && (
                  <div>
                    <span className="text-sm font-medium">Descripción:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {courtsDetail.descripcion}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <ProtectedComponent
          permissions={[
            PERMISSIONS.EDITAR_CANCHAS,
            PERMISSIONS.ELIMINAR_CANCHAS,
          ]}
        >
          <Card>
            <CardHeader>
              <CardTitle>Acciones de Administrador</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <ProtectedButton
                  permissions={PERMISSIONS.EDITAR_CANCHAS}
                  onClick={onEditar}
                  variant="outline"
                  disabled={loading}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Cancha
                </ProtectedButton>

                {onToggleDisponibilidad && (
                  <ProtectedButton
                    permissions={PERMISSIONS.EDITAR_CANCHAS}
                    onClick={onToggleDisponibilidad}
                    variant="outline"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {courtsDetail.disponible
                      ? "Marcar No Disponible"
                      : "Marcar Disponible"}
                  </ProtectedButton>
                )}

                <ProtectedButton
                  permissions={PERMISSIONS.ELIMINAR_CANCHAS}
                  onClick={onEliminar}
                  variant="destructive"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Eliminar Cancha
                </ProtectedButton>
              </div>
            </CardContent>
          </Card>
        </ProtectedComponent>
      </div>
    );
  }
);

export default CourtsDetail;
