'use client';

import React, { useState, useEffect } from 'react';
import { 
  getCourtSpecialDays, 
  createSpecialDay, 
  createMaintenancePeriod,
  updateSpecialDay, 
  deleteSpecialDay 
} from '@/lib/booking-actions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Edit, Trash2, Plus, Wrench, AlertTriangle, Star } from "lucide-react";
import { toast } from "sonner";
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { PERMISSIONS } from '@/lib/permissions';

const TIPOS_DIA = {
  'feriado': { label: 'Feriado', color: 'bg-red-100 text-red-800', icon: Star },
  'evento_especial': { label: 'Evento Especial', color: 'bg-purple-100 text-purple-800', icon: Star },
  'mantenimiento': { label: 'Mantenimiento', color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
  'cierre_temporal': { label: 'Cierre Temporal', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle },
  'horario_extendido': { label: 'Horario Extendido', color: 'bg-green-100 text-green-800', icon: Calendar }
};

const ESTADOS = {
  'cerrado': { label: 'Cerrado', color: 'bg-red-100 text-red-800' },
  'abierto': { label: 'Abierto', color: 'bg-green-100 text-green-800' },
  'horario_especial': { label: 'Horario Especial', color: 'bg-blue-100 text-blue-800' }
};

export default function GestionDiasEspeciales({ canchaId, refreshTrigger }) {
  const [diasEspeciales, setDiasEspeciales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);

  // Cargar días especiales
  const loadDiasEspeciales = async () => {
    setLoading(true);
    try {
      // Cargar días especiales de los próximos 6 meses
      const fechaDesde = new Date().toISOString().split('T')[0];
      const fechaHasta = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const data = await getCourtSpecialDays(canchaId, fechaDesde, fechaHasta);
      setDiasEspeciales(data);
    } catch (error) {
      console.error('Error cargando días especiales:', error);
      toast.error('Error al cargar días especiales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canchaId) {
      loadDiasEspeciales();
    }
  }, [canchaId, refreshTrigger]);

  // Crear día especial
  const handleCreateSpecialDay = async (dayData) => {
    try {
      await createSpecialDay(dayData);
      toast.success('✅ Día especial creado');
      setDialogOpen(false);
      loadDiasEspeciales();
    } catch (error) {
      console.error('Error creando día especial:', error);
      toast.error('Error al crear día especial');
    }
  };

  // Crear mantenimiento
  const handleCreateMaintenance = async (maintenanceData) => {
    try {
      await createMaintenancePeriod(
        canchaId, 
        maintenanceData.fechaInicio, 
        maintenanceData.fechaFin, 
        maintenanceData.descripcion
      );
      toast.success('✅ Período de mantenimiento creado');
      setMaintenanceDialogOpen(false);
      loadDiasEspeciales();
    } catch (error) {
      console.error('Error creando mantenimiento:', error);
      toast.error('Error al crear mantenimiento');
    }
  };

  // Editar día especial
  const handleEditSpecialDay = async (dayData) => {
    try {
      await updateSpecialDay(editingDay.dia_especial_id, dayData);
      toast.success('✅ Día especial actualizado');
      setDialogOpen(false);
      setEditingDay(null);
      loadDiasEspeciales();
    } catch (error) {
      console.error('Error editando día especial:', error);
      toast.error('Error al actualizar día especial');
    }
  };

  // Eliminar día especial
  const handleDeleteSpecialDay = async (diaEspecialId) => {
    if (!confirm('¿Estás seguro de eliminar este día especial?')) return;
    
    try {
      await deleteSpecialDay(diaEspecialId);
      toast.success('✅ Día especial eliminado');
      loadDiasEspeciales();
    } catch (error) {
      console.error('Error eliminando día especial:', error);
      toast.error('Error al eliminar día especial');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Cargando días especiales...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Días Especiales ({diasEspeciales.length})
            </CardTitle>
            <div className="flex gap-2">
              <ProtectedComponent permissions={PERMISSIONS.EDITAR_CANCHAS}>
                <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Wrench className="h-4 w-4 mr-2" />
                      Mantenimiento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Período de Mantenimiento</DialogTitle>
                    </DialogHeader>
                    <MaintenanceForm onSave={handleCreateMaintenance} />
                  </DialogContent>
                </Dialog>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Día
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingDay ? 'Editar Día Especial' : 'Crear Día Especial'}
                      </DialogTitle>
                    </DialogHeader>
                    <SpecialDayForm 
                      canchaId={canchaId}
                      initialData={editingDay}
                      onSave={editingDay ? handleEditSpecialDay : handleCreateSpecialDay}
                      onCancel={() => {
                        setDialogOpen(false);
                        setEditingDay(null);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </ProtectedComponent>
              
              <Button onClick={loadDiasEspeciales} variant="outline" size="sm">
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {diasEspeciales.length > 0 ? (
        <div className="grid gap-4">
          {diasEspeciales.map((dia) => {
            const tipoInfo = TIPOS_DIA[dia.tipo] || TIPOS_DIA['evento_especial'];
            const estadoInfo = ESTADOS[dia.estado] || ESTADOS['cerrado'];
            const IconComponent = tipoInfo.icon;

            return (
              <Card key={dia.dia_especial_id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        <div>
                          <h3 className="font-semibold">
                            {new Date(dia.fecha).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h3>
                          <p className="text-sm text-muted-foreground">{dia.descripcion}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Badge className={tipoInfo.color}>
                          {tipoInfo.label}
                        </Badge>
                        <Badge className={estadoInfo.color}>
                          {estadoInfo.label}
                        </Badge>
                      </div>

                      {dia.precio_especial && (
                        <Badge variant="outline">
                          ${dia.precio_especial}
                        </Badge>
                      )}

                      {(dia.hora_inicio && dia.hora_fin) && (
                        <Badge variant="outline">
                          {dia.hora_inicio} - {dia.hora_fin}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <ProtectedComponent permissions={PERMISSIONS.EDITAR_CANCHAS}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingDay(dia);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteSpecialDay(dia.dia_especial_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </ProtectedComponent>
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
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No hay días especiales configurados</h3>
            <p className="text-muted-foreground mb-4">
              Crea días especiales para feriados, mantenimiento o eventos.
            </p>
            <ProtectedComponent permissions={PERMISSIONS.EDITAR_CANCHAS}>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Día Especial
              </Button>
            </ProtectedComponent>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Formulario para crear/editar día especial
function SpecialDayForm({ canchaId, initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    cancha_id: canchaId,
    fecha: initialData?.fecha?.split('T')[0] || '',
    tipo: initialData?.tipo || 'feriado',
    estado: initialData?.estado || 'cerrado',
    descripcion: initialData?.descripcion || '',
    hora_inicio: initialData?.hora_inicio || '',
    hora_fin: initialData?.hora_fin || '',
    precio_especial: initialData?.precio_especial || '',
    notas: initialData?.notas || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSend = {
      ...formData,
      precio_especial: formData.precio_especial ? parseFloat(formData.precio_especial) : null
    };
    
    onSave(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Fecha</Label>
        <Input
          type="date"
          value={formData.fecha}
          onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo</Label>
          <select 
            value={formData.tipo}
            onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
            className="w-full p-2 border rounded-md"
          >
            <option value="feriado">Feriado</option>
            <option value="evento_especial">Evento Especial</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="cierre_temporal">Cierre Temporal</option>
            <option value="horario_extendido">Horario Extendido</option>
          </select>
        </div>

        <div>
          <Label>Estado</Label>
          <select 
            value={formData.estado}
            onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
            className="w-full p-2 border rounded-md"
          >
            <option value="cerrado">Cerrado</option>
            <option value="abierto">Abierto</option>
            <option value="horario_especial">Horario Especial</option>
          </select>
        </div>
      </div>

      <div>
        <Label>Descripción</Label>
        <Input
          value={formData.descripcion}
          onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
          placeholder="Ej: Día de la Independencia"
          required
        />
      </div>

      {formData.estado === 'horario_especial' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Hora Inicio</Label>
            <Input
              type="time"
              value={formData.hora_inicio}
              onChange={(e) => setFormData(prev => ({ ...prev, hora_inicio: e.target.value }))}
            />
          </div>
          <div>
            <Label>Hora Fin</Label>
            <Input
              type="time"
              value={formData.hora_fin}
              onChange={(e) => setFormData(prev => ({ ...prev, hora_fin: e.target.value }))}
            />
          </div>
        </div>
      )}

      <div>
        <Label>Precio Especial (opcional)</Label>
        <Input
          type="number"
          step="0.01"
          value={formData.precio_especial}
          onChange={(e) => setFormData(prev => ({ ...prev, precio_especial: e.target.value }))}
          placeholder="Precio especial para este día"
        />
      </div>

      <div>
        <Label>Notas (opcional)</Label>
        <Input
          value={formData.notas}
          onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
          placeholder="Notas adicionales"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}

// Formulario para mantenimiento
function MaintenanceForm({ onSave }) {
  const [formData, setFormData] = useState({
    fechaInicio: '',
    fechaFin: '',
    descripcion: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fecha Inicio</Label>
          <Input
            type="date"
            value={formData.fechaInicio}
            onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label>Fecha Fin</Label>
          <Input
            type="date"
            value={formData.fechaFin}
            onChange={(e) => setFormData(prev => ({ ...prev, fechaFin: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label>Descripción</Label>
        <Input
          value={formData.descripcion}
          onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
          placeholder="Ej: Renovación de césped sintético"
          required
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="submit">Crear Mantenimiento</Button>
      </div>
    </form>
  );
}
