"use client"

import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProtectedComponent, ProtectedButton } from "@/components/ProtectedComponent"
import { PERMISSIONS } from "@/lib/permissions"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Eye,
  Trash2,
  PlayCircle,
  StopCircle,
  Plus,
  Filter,
  Search
} from "lucide-react"

const BookingsCard = ({ 
  booking = [], 
  userRole = 'usuario',
  currentUserId = null,
  onView,
  onEdit, 
  onApprove, 
  onCancel, 
  onDelete,
  onCheckIn,
  onCheckOut,
  showCreateButton = true
}) => {
  
  // Función para obtener las acciones disponibles según el rol
  const getRoleActions = (role, bookingItem) => {
    const baseActions = {
      administrador: ['view', 'edit', 'approve', 'cancel', 'delete', 'checkin', 'checkout'],
 
      usuario: ['view']
    }

    // Si es usuario normal, verificar si es SU reserva para dar más permisos
    if (role === 'usuario' && bookingItem.user_id === currentUserId) {
      return ['view', 'edit', 'cancel'] // Puede editar/cancelar sus propias reservas
    }

    return baseActions[role] || ['view']
  }

  // Función simple para verificar si puede hacer acción en ESTA reserva específica
  const canDoAction = (action, bookingItem) => {
    // Admin y gerente pueden hacer todo
    if (['administrador', 'gerente'].includes(userRole)) {
      return true
    }

    // Usuario normal solo puede actuar en SUS reservas
    if (userRole === 'usuario') {
      return bookingItem.user_id === currentUserId
    }

  

    return false
  }

  // Función para obtener el badge de estado
  const getStatusBadge = (status) => {
    const statusConfig = {
      'pendiente': { variant: 'secondary', text: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      'confirmada': { variant: 'default', text: 'Confirmada', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      'en_progreso': { variant: 'outline', text: 'En Progreso', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      'completada': { variant: 'success', text: 'Completada', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      'cancelada': { variant: 'destructive', text: 'Cancelada', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
    }
    const config = statusConfig[status] || statusConfig['pendiente']
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.text}
      </Badge>
    )
  }

  // Formatear fecha y hora
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    // Si viene con fecha completa, extraer solo la hora
    const time = timeString.includes('T') ? timeString.split('T')[1] : timeString
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header con título y acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reservas</h1>
          <p className="text-muted-foreground">
            Gestiona las reservas del sistema
          </p>
        </div>
        
        <div className="flex gap-2">

          {showCreateButton && (
            <ProtectedComponent permissions={PERMISSIONS.CREAR_RESERVAS}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Reserva
              </Button>
            </ProtectedComponent>
          )}
          
          {/* Filtros adicionales */}
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Lista de reservas */}
      {booking.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {booking.map((b) => {
            const availableActions = getRoleActions(userRole, b)
            
            return (
              <Card key={b.id || b.reserva_id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold">
                        Reserva #{b.reserva_id}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(b.fecha_inicio)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(b.estado)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Información básica */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {formatTime(b.fecha_inicio)} - {formatTime(b.fecha_fin)}
                      </span>
                    </div>

                    {b.cancha_nombre && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{b.cancha_nombre}</span>
                      </div>
                    )}

                    {/* Mostrar usuario solo si no es el usuario actual */}
                    {userRole !== 'usuario' && b.usuario_nombre && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{b.usuario_nombre}</span>
                      </div>
                    )}

                    {b.precio_total && (
                      <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Total:</span>
                        <span className="text-sm font-bold text-green-600">
                          ${b.precio_total?.toLocaleString('es-CL')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {/* Ver detalles - URL dinámica según rol */}
                    {availableActions.includes('view') && (
                      <Link 
                        href={
                          userRole === 'usuario' 
                            ? `/user/bookings/${b.reserva_id}` 
                           
                            : `/admin/bookings/${b.reserva_id}`
                        } 
                        className="flex-1"
                      >
                        <ProtectedButton
                          permissions={PERMISSIONS.VER_RESERVAS}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {userRole === 'usuario' ? 'Ver Mi Reserva' : 'Ver Detalles'}
                        </ProtectedButton>
                      </Link>
                    )}

                    {/* Editar */}
                    {availableActions.includes('edit') && b.estado !== 'completada' && (
                      <ProtectedButton
                        permissions={PERMISSIONS.EDITAR_RESERVAS}
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit?.(b)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </ProtectedButton>
                    )}

                    {/* Aprobar */}
                    {availableActions.includes('approve') && b.estado === 'pendiente' && (
                      <ProtectedButton
                        permissions={PERMISSIONS.APROBAR_RESERVAS}
                        variant="default"
                        size="sm"
                        onClick={() => onApprove?.(b)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprobar
                      </ProtectedButton>
                    )}

                    {/* Check-in */}
                    {availableActions.includes('checkin') && b.estado === 'confirmada' && (
                      <ProtectedButton
                        permissions={PERMISSIONS.GESTIONAR_CHECKIN}
                        variant="outline"
                        size="sm"
                        onClick={() => onCheckIn?.(b)}
                      >
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Check-in
                      </ProtectedButton>
                    )}

                    {/* Check-out */}
                    {availableActions.includes('checkout') && b.estado === 'en_progreso' && (
                      <ProtectedButton
                        permissions={PERMISSIONS.GESTIONAR_CHECKIN}
                        variant="outline"
                        size="sm"
                        onClick={() => onCheckOut?.(b)}
                      >
                        <StopCircle className="h-4 w-4 mr-1" />
                        Check-out
                      </ProtectedButton>
                    )}

                    {/* Cancelar */}
                    {availableActions.includes('cancel') && ['pendiente', 'confirmada'].includes(b.estado) && (
                      <ProtectedButton
                        permissions={PERMISSIONS.CANCELAR_RESERVAS}
                        variant="destructive"
                        size="sm"
                        onClick={() => onCancel?.(b)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar
                      </ProtectedButton>
                    )}

                    {/* Eliminar (solo admin) */}
                    {availableActions.includes('delete') && (
                      <ProtectedComponent permissions={PERMISSIONS.ELIMINAR_RESERVAS}>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete?.(b)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </ProtectedComponent>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay reservas disponibles</h3>
              <p className="text-muted-foreground mb-4">
                No se encontraron reservas en el sistema.
              </p>
              {showCreateButton && (
                <ProtectedComponent permissions={PERMISSIONS.CREAR_RESERVAS}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Reserva
                  </Button>
                </ProtectedComponent>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BookingsCard
