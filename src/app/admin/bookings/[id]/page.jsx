import { getDetailsBooking } from '@/lib/server-actions'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BookingActionsCard } from "@/components/BookingActionsCard"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Mail, 
  DollarSign, 
  FileText, 
  ArrowLeft,
  Phone,
  Building,
  Activity
} from "lucide-react"
import Link from 'next/link'

const page = async ({ params }) => {
    let bookingDetails = {}
    try {
        // Await the params in Server Components
        const resolvedParams = await params;
        bookingDetails = await getDetailsBooking(resolvedParams.id)
    } catch (error) {
        console.error('Error fetching booking details:', error)
    }

    const { 
        reserva_id, 
        fecha_inicio, 
        fecha_fin, 
        precio_total, 
        estado, 
        notas, 
        fecha_creacion, 
        fecha_actualizacion, 
        usuario = {}, 
        cancha = {} 
    } = bookingDetails

    
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A'
        return new Date(dateTimeString).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }


    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pendiente': { variant: 'secondary', text: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
            'confirmada': { variant: 'default', text: 'Confirmada', className: 'bg-blue-100 text-blue-800' },
            'en_progreso': { variant: 'outline', text: 'En Progreso', className: 'bg-green-100 text-green-800' },
            'completada': { variant: 'success', text: 'Completada', className: 'bg-green-100 text-green-800' },
            'cancelada': { variant: 'destructive', text: 'Cancelada', className: 'bg-red-100 text-red-800' }
        }
        const config = statusConfig[status] || statusConfig['pendiente']
        return (
            <Badge variant={config.variant} className={config.className}>
                {config.text}
            </Badge>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl space-y-6">
            {/* Header con botón de regreso */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/bookings">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Detalles de Reserva</h1>
                        <p className="text-muted-foreground">Reserva #{reserva_id}</p>
                    </div>
                </div>
                {estado && getStatusBadge(estado)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Información de la Reserva
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Fecha y Hora de Inicio
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>{formatDateTime(fecha_inicio)}</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Fecha y Hora de Fin
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>{formatDateTime(fecha_fin)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Precio Total
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-lg font-semibold text-green-600">
                                            ${precio_total?.toLocaleString('es-CL') || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Estado
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                        {getStatusBadge(estado)}
                                    </div>
                                </div>
                            </div>

                            {notas && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Notas Adicionales
                                        </label>
                                        <div className="p-3 bg-muted rounded-lg">
                                            <p className="text-sm">{notas}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Información de la Cancha */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Información de la Cancha
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Nombre de la Cancha
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{cancha.nombre || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Tipo de Deporte
                                    </label>
                                    <Badge variant="outline" className="w-fit">
                                        {cancha.tipo_deporte || 'N/A'}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Ubicación
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{cancha.ubicacion || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Precio por Hora
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">
                                            ${cancha.precio_por_hora?.toLocaleString('es-CL') || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar con información del usuario y metadatos */}
                <div className="space-y-6">
                    {/* Información del Usuario */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Nombre de Usuario
                                    </label>
                                    <p className="font-medium">{usuario.username || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Apellido
                                    </label>
                                    <p>{usuario.last_name || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Email
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{usuario.email || 'N/A'}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        ID de Usuario
                                    </label>
                                    <p className="text-sm text-muted-foreground">{usuario.user_id || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metadatos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Metadatos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Fecha de Creación
                                </label>
                                <p className="text-sm">{formatDate(fecha_creacion)}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Última Actualización
                                </label>
                                <p className="text-sm">
                                    {fecha_actualizacion ? formatDate(fecha_actualizacion) : 'Sin actualizaciones'}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    ID de Cancha
                                </label>
                                <p className="text-sm text-muted-foreground">{cancha.cancha_id || 'N/A'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Acciones Rápidas */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Acciones</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BookingActionsCard 
                                booking={bookingDetails} 
                                userRole="administrador" 
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default page
