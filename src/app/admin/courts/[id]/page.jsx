'use client'

import { useParams } from 'next/navigation';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { getDetailsCourts } from '@/lib/server-actions';
import CourtsDetail from '@/modules/courts/components/courtsDetail';
import { Button } from "@/components/ui/button";
import { Clock, Settings } from "lucide-react";
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { PERMISSIONS } from '@/lib/permissions';

function Page() {
  const id = useParams().id;
  const [courtsDetail, setCourtsDetail] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCourtDetails() {
      try {
        const details = await getDetailsCourts(id);
        setCourtsDetail(details);
      } catch (err) {
        console.error('Error al cargar los detalles de la cancha:', err);
        setError('No se pudieron cargar los detalles de la cancha.');
      }
    }

    fetchCourtDetails();
  }, [id]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!courtsDetail) {
    return <p>Cargando detalles de la cancha...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          
        </div>
        
        <ProtectedComponent permissions={PERMISSIONS.ELIMINAR_CANCHAS}>
          <Link href={`/admin/courts/${id}/horarios`}>
            <Button className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Gestionar Horarios
            </Button>
          </Link>
        </ProtectedComponent>
      </div>
      
      <CourtsDetail courtsDetail={courtsDetail} />
    </div>
  );
}

export default Page;

