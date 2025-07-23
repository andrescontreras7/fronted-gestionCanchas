import { getDetailsCourts } from '@/lib/server-actions';
import CourtsDetailContainer from '@/modules/courts/components/CourtsDetailContainer';
import { headers } from 'next/headers';
import React from 'react';

async function page({ params }) {
  let courtsDetail = {};
  let userRole = '';

  try {

    const resolvedParams = await params;
    courtsDetail = await getDetailsCourts(resolvedParams.id);
    const headersList = headers();
    userRole = headersList.get('x-user-role') || 'usuario';


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