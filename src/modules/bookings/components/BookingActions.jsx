"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { ProtectedButton } from "@/components/ProtectedComponent"
import { PERMISSIONS } from "@/lib/permissions"
import { 
  Edit, 
  Mail, 
  Trash2, 
  CheckCircle, 
  XCircle,
  FileText,
  Download
} from "lucide-react"

export const BookingActions = ({ 
  booking, 
  userRole,
  onEdit,
  onSendNotification,
  onCancel,
  onApprove,
  onGenerateReport
}) => {
  
  const canEdit = ['administrador', 'gerente'].includes(userRole)
  const canApprove = ['administrador', 'gerente'].includes(userRole) && booking.estado === 'pendiente'
  const canCancel = ['administrador', 'gerente'].includes(userRole) && ['pendiente', 'confirmada'].includes(booking.estado)

  return (
    <div className="space-y-2">
      {/* Editar Reserva */}
      <ProtectedButton 
        permissions={PERMISSIONS.EDITAR_RESERVAS}
        className="w-full" 
        variant="outline"
        onClick={() => onEdit?.(booking)}
        disabled={!canEdit}
      >
        <Edit className="h-4 w-4 mr-2" />
        Editar Reserva
      </ProtectedButton>

      {/* Aprobar Reserva */}
      {canApprove && (
        <ProtectedButton 
          permissions={PERMISSIONS.APROBAR_RESERVAS}
          className="w-full" 
          variant="default"
          onClick={() => onApprove?.(booking)}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Aprobar Reserva
        </ProtectedButton>
      )}

      {/* Enviar Notificación */}
      <ProtectedButton 
        permissions={PERMISSIONS.VER_RESERVAS}
        className="w-full" 
        variant="outline"
        onClick={() => onSendNotification?.(booking)}
      >
        <Mail className="h-4 w-4 mr-2" />
        Enviar Notificación
      </ProtectedButton>

      {/* Generar Reporte */}
      <ProtectedButton 
        permissions={PERMISSIONS.VER_RESERVAS}
        className="w-full" 
        variant="outline"
        onClick={() => onGenerateReport?.(booking)}
      >
        <Download className="h-4 w-4 mr-2" />
        Generar Reporte
      </ProtectedButton>

      {/* Cancelar Reserva */}
      {canCancel && (
        <ProtectedButton 
          permissions={PERMISSIONS.CANCELAR_RESERVAS}
          className="w-full" 
          variant="destructive"
          onClick={() => onCancel?.(booking)}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Cancelar Reserva
        </ProtectedButton>
      )}
    </div>
  )
}
