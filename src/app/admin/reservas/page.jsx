'use client';

import React, { useState, useEffect } from 'react';
import { getCourtsWithStats } from '@/lib/booking-actions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, MapPin } from "lucide-react";
import { toast } from "sonner";
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { PERMISSIONS } from '@/lib/permissions';

export default function ReservasAdminPage() {
  const [canchas, setCanchas] = useState([]);
  const [selectedCancha, setSelectedCancha] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadCanchas = async () => {
    setLoading(true);
    try {
      const data = await getCourtsWithStats();
      setCanchas(data);
      
      // Auto-seleccionar primera cancha si existe
      if (data.length > 0 && !selectedCancha) {
        setSelectedCancha(data[0].cancha_id);
      }
    } catch (error) {
      console.error('Error cargando canchas:', error);
      toast.error('Error al cargar canchas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCanchas();
  }, []);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const selectedCanchaData = canchas.find(c => c.cancha_id === selectedCancha);

  return (
    <ProtectedComponent permissions={PERMISSIONS.VER_RESERVAS}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Gestión de Reservas
            </h1>
            <p className="text-muted-foreground mt-2">
              Administra todas las reservas del sistema
            </p>
          </div>
          
          <Badge variant="outline" className="text-sm">
            <Users className="h-4 w-4 mr-1" />
            Administrador
          </Badge>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Seleccionar Cancha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={selectedCancha} onValueChange={setSelectedCancha}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una cancha..." />
                </SelectTrigger>
                <SelectContent>
                  {canchas.map((cancha) => (
                    <SelectItem key={cancha.cancha_id} value={cancha.cancha_id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cancha.nombre}</span>
                        <Badge variant="outline" className="text-xs">
                          {cancha.tipo}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedCanchaData && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-medium">{selectedCanchaData.nombre}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedCanchaData.ubicacion} • {selectedCanchaData.tipo}
                      </p>
                    </div>
                    <Badge variant="outline">
                      ${selectedCanchaData.precio_base}/hora
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gestión de Reservas */}
        {selectedCancha && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Gestión de Reservas - Cancha {selectedCanchaData?.nombre}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Funcionalidad en desarrollo</h3>
              <p className="text-muted-foreground mb-4">
                La gestión de reservas para esta cancha estará disponible pronto.
              </p>
              <p className="text-sm text-muted-foreground">
                Por ahora, puedes gestionar todas las reservas desde la sección "Historial" en el menú lateral.
              </p>
            </CardContent>
          </Card>
        )}

        {!selectedCancha && canchas.length > 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Selecciona una cancha</h3>
              <p className="text-muted-foreground">
                Elige una cancha para ver y gestionar sus reservas.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedComponent>
  );
}