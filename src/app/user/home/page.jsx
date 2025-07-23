'use client'


import { ProtectedComponent } from "@/components/ProtectedComponent";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermision";

import { PERMISSIONS } from "@/lib/permissions"
export default function UserHomePage() {
   const { hasPermission, permissions, isLoading } = usePermissions()
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Panel de Usuario
      </h1>
      <p className="text-gray-600">
        Bienvenido a tu panel personal. Desde aquí puedes gestionar tus reservas y ver las canchas disponibles.
      </p>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold">Mis Reservas</h3>
          <p className="text-sm text-gray-500">Ver y gestionar tus reservas activas</p>
        </div>
      {hasPermission(PERMISSIONS.CREAR_CANCHAS) && (
          <Button variant="outline" className="justify-start">

            Ver Canchas
          </Button>
        )}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold">Canchas Disponibles</h3>
          <p className="text-sm text-gray-500">Explorar canchas disponibles para reservar</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold">Mi Perfil</h3>
          <p className="text-sm text-gray-500">Actualizar información personal</p>
        </div>
      </div>
    </div>
  )
}
