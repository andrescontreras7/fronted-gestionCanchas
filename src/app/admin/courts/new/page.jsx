'use client';

import React, { useState } from 'react';
import { createCourt } from '@/lib/booking-actions';
import { toast } from "sonner";
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { PERMISSIONS } from '@/lib/permissions';
import { useRouter } from 'next/navigation';
import NewCourtForm from '@/components/admin/NewCourtForm';

export default function NewCourtPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    ubicacion: '',
    tipo_deporte: '',
    precio_por_hora: '',
    capacidad_jugadores: '',
    disponible: true,
    estado: 'configuracion'
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    
    if (!formData.tipo_deporte) {
      toast.error('El tipo de deporte es requerido');
      return;
    }
    
    if (!formData.precio_por_hora || parseFloat(formData.precio_por_hora) <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return;
    }

    setSaving(true);
    
    try {
      // Preparar datos para el backend
      const dataToSend = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        ubicacion: formData.ubicacion.trim() || null,
        tipo_deporte: formData.tipo_deporte,
        precio_por_hora: parseFloat(formData.precio_por_hora),
        capacidad_jugadores: formData.capacidad_jugadores ? parseInt(formData.capacidad_jugadores) : null,
        disponible: formData.disponible
      };

      console.log('Enviando datos al backend:', dataToSend);
      
      const result = await createCourt(dataToSend);
      
      toast.success('✅ Cancha creada exitosamente');
      console.log('Cancha creada:', result);
      
      // Redirigir a la lista de canchas
      router.push('/admin/courts');
      
    } catch (error) {
      console.error('Error creando cancha:', error);
      toast.error(`Error al crear la cancha: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedComponent permissions={PERMISSIONS.CREAR_CANCHAS}>
      <NewCourtForm
        formData={formData}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </ProtectedComponent>
  );
}
