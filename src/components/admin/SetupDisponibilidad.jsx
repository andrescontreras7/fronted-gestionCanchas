'use client';

import React, { useState } from 'react';
import { setupCourtAvailability } from '@/lib/booking-actions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Settings, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function SetupDisponibilidad({ canchaId, onSetupComplete }) {
  const [loading, setLoading] = useState(false);

  const handleSetup = async (tipoHorario) => {
    setLoading(true);
    try {
      console.log('🔧 Configurando horarios:', { canchaId, tipoHorario });
      
      const result = await setupCourtAvailability(canchaId, tipoHorario);
      
      toast.success('✅ Horarios configurados correctamente');
      
      if (onSetupComplete) {
        onSetupComplete(result);
      }
    } catch (error) {
      console.error('❌ Error en setup:', error);
      toast.error('Error al configurar horarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración Inicial de Horarios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Configura los horarios base para esta cancha. Puedes ajustarlos individualmente después.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Horario Completo */}
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Horario Completo</h3>
                  <Badge variant="secondary">119 bloques</Badge>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Lunes a Domingo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>6:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Ideal para canchas de uso intensivo</span>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSetup('completo')}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Configurando...' : 'Configurar Horario Completo'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Horario Laboral */}
          <Card className="border-2 hover:border-green-200 transition-colors">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Horario Laboral</h3>
                  <Badge variant="outline">50 bloques</Badge>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Lunes a Viernes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Ideal para canchas corporativas</span>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSetup('laboral')}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? 'Configurando...' : 'Configurar Horario Laboral'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-blue-900">¿Qué incluye la configuración?</p>
              <ul className="mt-1 text-blue-700 space-y-1">
                <li>• Creación automática de bloques de 1 hora</li>
                <li>• Horarios establecidos según el tipo seleccionado</li>
                <li>• Todos los bloques inicialmente disponibles</li>
                <li>• Posibilidad de editar cada bloque individualmente</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
