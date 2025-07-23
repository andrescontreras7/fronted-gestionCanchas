import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Users, Calendar } from "lucide-react";

function UserCourtsComponents({ courts }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold ">Canchas Disponibles</h1>
       
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courts.map(court => (
          <Card key={court.cancha_id || court.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl uppercase font-semibold mb-2">{court.nombre}</h2>
                  {court.tipo_deporte && (
                    <Badge variant="secondary" className="mb-2">
                      {court.tipo_deporte}
                    </Badge>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center  ">
                      <MapPin size={16} className="mr-2" />
                      <p className="text-sm">{court.ubicacion}</p>
                    </div>
                    
                    {court.precio_por_hora && (
                      <div className="flex items-center  ">
                        <DollarSign size={16} className="mr-2" />
                        <p className="text-sm">${court.precio_por_hora}/hora</p>
                      </div>
                    )}
                    
                    {court.capacidad_jugadores && (
                      <div className="flex items-center">
                        <Users size={16} className="mr-2" />
                        <p className="text-sm">Hasta {court.capacidad_jugadores} jugadores</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {court.descripcion && (
                <p className=" text-sm mb-4 line-clamp-2">
                  {court.descripcion}
                </p>
              )}
              
              <div className="flex gap-2 mt-6">
                <Link href={`/user/courts/${court.cancha_id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Ver Detalles
                  </Button>
                </Link>
                
                <Link href={`/user/bookings/new?court_id=${court.cancha_id}`} className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Calendar size={16} className="mr-2" />
                    Reservar
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {courts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 text-lg">No hay canchas disponibles en este momento.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default UserCourtsComponents;
