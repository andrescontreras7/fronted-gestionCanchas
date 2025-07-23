"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewCourtForm({
  formData,
  onInputChange,
  onSelectChange,
  onSubmit,
  saving,
}) {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nueva Cancha</h1>
          <p className="text-muted-foreground">
            Crea una nueva cancha para tu complejo deportivo
          </p>
        </div>

        <Link href="/admin/courts">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Cancha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Cancha *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={onInputChange}
                  placeholder="Ej: Cancha de Fútbol #1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_deporte">Tipo de Deporte *</Label>
                <Select
                  value={formData.tipo_deporte}
                  onValueChange={(value) =>
                    onSelectChange("tipo_deporte", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el deporte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="futbol">Fútbol</SelectItem>
                    <SelectItem value="basquet">Básquet</SelectItem>
                    <SelectItem value="tenis">Tenis</SelectItem>
                    <SelectItem value="voley">Voley</SelectItem>
                    <SelectItem value="paddle">Pádel</SelectItem>
                    <SelectItem value="multideporte">Multideporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ubicacion">Ubicación</Label>
                <Input
                  id="ubicacion"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={onInputChange}
                  placeholder="Ej: Sector A, Nivel 1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacidad_jugadores">
                  Capacidad de Jugadores
                </Label>
                <Input
                  id="capacidad_jugadores"
                  name="capacidad_jugadores"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.capacidad_jugadores}
                  onChange={onInputChange}
                  placeholder="Ej: 10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio_por_hora">Precio por Hora *</Label>
                <Input
                  id="precio_por_hora"
                  name="precio_por_hora"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_por_hora}
                  onChange={onInputChange}
                  placeholder="Ej: 25.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado Inicial</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => onSelectChange("estado", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el estado inicial" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="configuracion">
                      En Configuración
                    </SelectItem>
                    <SelectItem value="activa">Activa</SelectItem>
                    <SelectItem value="mantenimiento">
                      En Mantenimiento
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={onInputChange}
                placeholder="Describe la cancha, sus características, equipamiento disponible..."
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="disponible"
                name="disponible"
                checked={formData.disponible}
                onCheckedChange={(checked) =>
                  onSelectChange("disponible", checked)
                }
              />
              <Label htmlFor="disponible">
                Cancha disponible para reservas inmediatamente
              </Label>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Cancha
                  </>
                )}
              </Button>

              <Link href="/admin/courts">
                <Button variant="outline" disabled={saving}>
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
