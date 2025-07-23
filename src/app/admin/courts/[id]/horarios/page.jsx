'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getDetailsCourts } from '@/lib/server-actions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { PERMISSIONS } from '@/lib/permissions';
import SetupDisponibilidad from "@/components/admin/SetupDisponibilidad";
import GestionBloques from "@/components/admin/GestionBloques";
import SetupFeriados from "@/components/admin/SetupFeriados";
import GestionDiasEspeciales from "@/components/admin/GestionDiasEspeciales";

export default function HorariosPage() {
  const { id } = useParams();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [specialDaysRefresh, setSpecialDaysRefresh] = useState(0);

  const loadCourtData = async () => {
    try {
      setLoading(true);
      const courtData = await getDetailsCourts(id);
      setCourt(courtData);
    } catch (error) {
      console.error("Error fetching court:", error);
      setError("Error al cargar los datos de la cancha");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadCourtData();
    }
  }, [id]);

  const handleSetupComplete = () => {
    // Trigger refresh para GestionBloques
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFeriadosSetupComplete = () => {
    // Trigger refresh para GestionDiasEspeciales
    setSpecialDaysRefresh(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">Cargando datos de la cancha...</div>
      </div>
    );
  }

  if (error || !court) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-muted-foreground">
          {error || "Cancha no encontrada"}
        </h1>
        <Link href="/admin/courts">
          <Button className="mt-4">Volver a Canchas</Button>
        </Link>
      </div>
    );
  }

  return (
    <ProtectedComponent permissions={PERMISSIONS.EDITAR_CANCHAS}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/admin/courts/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold">Gestión de Horarios</h1>
            <p className="text-muted-foreground">
              {court.nombre} - {court.tipo_deporte}
            </p>
          </div>
        </div>

        {/* Información de la cancha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información de la Cancha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Nombre</div>
                <div className="font-medium">{court.nombre}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Deporte</div>
                <div className="font-medium">{court.tipo_deporte}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Precio Base</div>
                <div className="font-medium">${court.precio_por_hora}/hora</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Inicial */}
        <SetupDisponibilidad 
          canchaId={id} 
          onSetupComplete={handleSetupComplete} 
        />

        {/* Gestión de Bloques */}
        <GestionBloques canchaId={id} refreshTrigger={refreshTrigger} />

        {/* Setup de Feriados */}
        <SetupFeriados 
          canchaId={id} 
          onSetupComplete={handleFeriadosSetupComplete} 
        />

        {/* Gestión de Días Especiales */}
        <GestionDiasEspeciales canchaId={id} refreshTrigger={specialDaysRefresh} />
      </div>
    </ProtectedComponent>
  );
}
