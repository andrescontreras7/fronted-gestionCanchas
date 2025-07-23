'use client';

import React, { useState } from 'react';
import { setupYearHolidays } from '@/lib/booking-actions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, Gift } from "lucide-react";
import { toast } from "sonner";

export default function SetupFeriados({ canchaId, onSetupComplete }) {
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSetupFeriados = async (year) => {
    setLoading(true);
    try {
      console.log('🎄 Configurando feriados:', { canchaId, year });
      
      const result = await setupYearHolidays(canchaId, year);
      
      toast.success(`✅ Feriados de ${year} configurados correctamente`);
      
      if (onSetupComplete) {
        onSetupComplete(result);
      }
    } catch (error) {
      console.error('❌ Error configurando feriados:', error);
      toast.error('Error al configurar feriados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Configuración de Feriados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Configura automáticamente los feriados nacionales para que la cancha aparezca como cerrada en esas fechas.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Año Anterior */}
          <Card className="border-2 hover:border-gray-200 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="space-y-3">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground" />
                <h3 className="font-semibold">{currentYear - 1}</h3>
                <p className="text-sm text-muted-foreground">Año anterior</p>
                <Button 
                  onClick={() => handleSetupFeriados(currentYear - 1)}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? 'Configurando...' : 'Configurar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Año Actual */}
          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="space-y-3">
                <div className="relative">
                  <Calendar className="h-8 w-8 mx-auto text-blue-600" />
                  <Star className="h-4 w-4 absolute -top-1 -right-1 text-yellow-500 fill-current" />
                </div>
                <h3 className="font-semibold text-blue-900">{currentYear}</h3>
                <Badge variant="default">Año Actual</Badge>
                <Button 
                  onClick={() => handleSetupFeriados(currentYear)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Configurando...' : 'Configurar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Año Siguiente */}
          <Card className="border-2 hover:border-green-200 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="space-y-3">
                <Calendar className="h-8 w-8 mx-auto text-green-600" />
                <h3 className="font-semibold">{currentYear + 1}</h3>
                <p className="text-sm text-muted-foreground">Año siguiente</p>
                <Button 
                  onClick={() => handleSetupFeriados(currentYear + 1)}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? 'Configurando...' : 'Configurar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">
              <Gift className="h-5 w-5" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-blue-900">¿Qué feriados se incluyen?</p>
              <ul className="mt-1 text-blue-700 space-y-1">
                <li>• Año Nuevo (1 de enero)</li>
                <li>• Día del Trabajo (1 de mayo)</li>
                <li>• Independencia (15 de septiembre)</li>
                <li>• Navidad (25 de diciembre)</li>
                <li>• Y otros feriados nacionales según el país</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
