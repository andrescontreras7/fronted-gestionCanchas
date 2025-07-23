'use client';

import React, { useState, useEffect } from 'react';
import { getCourtAvailability, updateAvailabilityBlock, deleteAvailabilityBlock } from '@/lib/booking-actions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Edit, Trash2, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { PERMISSIONS } from '@/lib/permissions';

const DIAS_SEMANA = {
  'lunes': 'Lun',
  'martes': 'Mar', 
  'miercoles': 'Mié',
  'jueves': 'Jue',
  'viernes': 'Vie',
  'sabado': 'Sáb',
  'domingo': 'Dom'
};

const ESTADOS = {
  'disponible': { label: 'Disponible', color: 'bg-green-100 text-green-800' },
  'no_disponible': { label: 'No Disponible', color: 'bg-red-100 text-red-800' },
  'mantenimiento': { label: 'Mantenimiento', color: 'bg-yellow-100 text-yellow-800' }
};

export default function GestionBloques({ canchaId, refreshTrigger }) {
  const [bloques, setBloques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Cargar bloques
  const loadBloques = async () => {
    setLoading(true);
    try {
      const data = await getCourtAvailability(canchaId);
      setBloques(data);
    } catch (error) {
      console.error('Error cargando bloques:', error);
      toast.error('Error al cargar bloques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canchaId) {
      loadBloques();
    }
  }, [canchaId, refreshTrigger]); // Agregamos refreshTrigger como dependencia

  // Editar bloque
  const handleEditBlock = async (blockData) => {
    try {
      await updateAvailabilityBlock(editingBlock.disponibilidad_id, blockData);
      toast.success('Bloque actualizado');
      setDialogOpen(false);
      setEditingBlock(null);
      loadBloques();
    } catch (error) {
      console.error('Error editando bloque:', error);
      toast.error('Error al actualizar bloque');
    }
  };

  // Eliminar bloque
  const handleDeleteBlock = async (disponibilidadId) => {
    if (!confirm('¿Estás seguro de eliminar este bloque?')) return;
    
    try {
      await deleteAvailabilityBlock(disponibilidadId);
      toast.success('Bloque eliminado');
      loadBloques();
    } catch (error) {
      console.error('Error eliminando bloque:', error);
      toast.error('Error al eliminar bloque');
    }
  };

  // Agrupar bloques por día
  const bloquesPorDia = bloques.reduce((acc, bloque) => {
    const dia = bloque.dia_semana;
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(bloque);
    return acc;
  }, {});

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Cargando bloques...</div>
        </CardContent>
      </Card>
    );
  }

  if (bloques.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay horarios configurados</h3>
          <p className="text-muted-foreground">
            Primero configura los horarios base usando el setup inicial.
          </p>
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
              <Clock className="h-5 w-5" />
              Gestión de Horarios ({bloques.length} bloques)
            </CardTitle>
            <Button onClick={loadBloques} variant="outline" size="sm">
              Actualizar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {Object.entries(bloquesPorDia).map(([dia, bloquesDia]) => (
        <Card key={dia}>
          <CardHeader>
            <CardTitle className="text-lg">
              {DIAS_SEMANA[dia]} ({bloquesDia.length} bloques)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {bloquesDia
                .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                .map((bloque) => (
                <div key={bloque.disponibilidad_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-sm">
                      {bloque.hora_inicio} - {bloque.hora_fin}
                    </div>
                    
                    <Badge className={ESTADOS[bloque.estado]?.color}>
                      {ESTADOS[bloque.estado]?.label}
                    </Badge>
                    
                    {bloque.precio_especial && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {bloque.precio_especial}
                      </Badge>
                    )}
                    
                    {bloque.notas && (
                      <span className="text-sm text-muted-foreground italic">
                        {bloque.notas}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <ProtectedComponent permissions={PERMISSIONS.EDITAR_CANCHAS}>
                      <Dialog open={dialogOpen && editingBlock?.disponibilidad_id === bloque.disponibilidad_id} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingBlock(bloque)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Bloque Horario</DialogTitle>
                          </DialogHeader>
                          <EditBlockForm 
                            block={editingBlock} 
                            onSave={handleEditBlock}
                            onCancel={() => setDialogOpen(false)}
                          />
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteBlock(bloque.disponibilidad_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </ProtectedComponent>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Componente para editar bloque
function EditBlockForm({ block, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    estado: block?.estado || 'disponible',
    precio_especial: block?.precio_especial || '',
    notas: block?.notas || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSend = {
      estado: formData.estado,
      notas: formData.notas
    };
    
    if (formData.precio_especial) {
      dataToSend.precio_especial = parseFloat(formData.precio_especial);
    }
    
    onSave(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Estado</Label>
        <select 
          value={formData.estado}
          onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
          className="w-full p-2 border rounded-md"
        >
          <option value="disponible">Disponible</option>
          <option value="no_disponible">No Disponible</option>
          <option value="mantenimiento">Mantenimiento</option>
        </select>
      </div>

      <div>
        <Label>Precio Especial (opcional)</Label>
        <Input
          type="number"
          step="0.01"
          value={formData.precio_especial}
          onChange={(e) => setFormData(prev => ({ ...prev, precio_especial: e.target.value }))}
          placeholder="Precio especial"
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
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
}
