'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getCourtById, updateCourt } from '@/lib/booking-actions';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from 'next/link';
import EditCourtForm from '@/components/admin/EditCourtForm';

export default function EditCourtPage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [court, setCourt] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo_deporte: '',
    ubicacion: '',
    capacidad_jugadores: '',
    precio_por_hora: '',
    disponible: true,
    estado: 'activa'
  });

  // Desenvolver params usando React.use()
  const resolvedParams = use(params);
  const courtId = resolvedParams.id;

  // Cargar datos de la cancha
  useEffect(() => {
    const loadCourt = async () => {
      try {
        const courtData = await getCourtById(courtId);
        setCourt(courtData);
        
        // Llenar el formulario con los datos existentes
        setFormData({
          nombre: courtData.nombre || '',
          descripcion: courtData.descripcion || '',
          tipo_deporte: courtData.tipo_deporte || courtData.tipo || '',
          ubicacion: courtData.ubicacion || '',
          capacidad_jugadores: courtData.capacidad_jugadores?.toString() || '',
          precio_por_hora: courtData.precio_por_hora?.toString() || courtData.precio_base?.toString() || '',
          disponible: courtData.disponible !== undefined ? courtData.disponible : true,
          estado: courtData.estado || 'activa'
        });
      } catch (error) {
        console.error('Error cargando cancha:', error);
        toast.error(`Error al cargar cancha: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (courtId) {
      loadCourt();
    }
  }, [courtId]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      toast.error('El nombre de la cancha es requerido');
      return;
    }
    
    if (!formData.tipo_deporte) {
      toast.error('El tipo de deporte es requerido');
      return;
    }

    setSaving(true);
    try {
      await updateCourt(courtId, formData);
      toast.success('✅ Cancha actualizada exitosamente');
      router.push('/admin/courts');
    } catch (error) {
      console.error('Error actualizando cancha:', error);
      toast.error(`❌ Error al actualizar cancha: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando datos de la cancha...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!court) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No se pudo cargar la cancha</p>
            <Link href="/admin/courts">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Canchas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <EditCourtForm
      court={court}
      formData={formData}
      onInputChange={handleInputChange}
      onSelectChange={handleSelectChange}
      onSubmit={handleSubmit}
      saving={saving}
    />
  );
}
