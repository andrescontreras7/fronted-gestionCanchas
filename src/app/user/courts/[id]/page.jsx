import { getDetailsCourts } from '@/lib/server-actions';
import CourtsDetailContainer from '@/modules/courts/components/CourtsDetailContainer';
import { headers } from 'next/headers';
import React from 'react';

async function page({ params }) {
  let courtsDetail = {};
  let userRole = ''; // Default fallback

  try {
    // Await the params in Server Components
    const resolvedParams = await params;
    courtsDetail = await getDetailsCourts(resolvedParams.id);
    const headersList = headers();
    userRole = headersList.get('x-user-role') || 'usuario';
    console.log('🔒 Rol del usuario:', userRole);

  } catch (error) {
    console.error('Error al cargar los detalles de la cancha:', error);
  }

  return (
    <CourtsDetailContainer 
      courtsDetail={courtsDetail} 
      role={userRole} 
    />
  );
}

export default page;