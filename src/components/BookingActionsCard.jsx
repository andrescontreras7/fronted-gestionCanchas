'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  X, 
  Edit,
  Mail,
  RefreshCw
} from "lucide-react";
import { cancelBooking, updateBookingStatus } from '@/lib/server-actions';
import { useRouter } from 'next/navigation';

export function BookingActionsCard({ booking, userRole = 'admin' }) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast.error('Debe proporcionar una razón para la cancelación');
      return;
    }

    setLoading(true);
    try {
      await cancelBooking(booking.reserva_id, cancelReason);
      toast.success('Reserva cancelada exitosamente');
      setCancelDialogOpen(false);
      setCancelReason('');
      router.refresh();
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      toast.error('Error al cancelar la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error('Debe seleccionar un nuevo estado');
      return;
    }

    setLoading(true);
    try {
      await updateBookingStatus(booking.reserva_id, newStatus);
      toast.success('Estado actualizado exitosamente');
      setStatusDialogOpen(false);
      setNewStatus('');
      router.refresh();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  const canCancelBooking = booking.estado !== 'cancelada' && booking.estado !== 'completada';
  const canUpdateStatus = userRole === 'admin' || userRole === 'administrador';

  return (
    <div className="space-y-2">
      {/* Botones de acción */}
      {canUpdateStatus && (
        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => setStatusDialogOpen(true)}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Cambiar Estado
        </Button>
      )}

      <Button 
        className="w-full" 
        variant="outline"
        disabled={loading}
      >
        <Edit className="h-4 w-4 mr-2" />
        Editar Reserva
      </Button>

      <Button 
        className="w-full" 
        variant="outline"
        disabled={loading}
      >
        <Mail className="h-4 w-4 mr-2" />
        Enviar Notificación
      </Button>

      {canCancelBooking && (
        <Button 
          className="w-full" 
          variant="destructive"
          onClick={() => setCancelDialogOpen(true)}
          disabled={loading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar Reserva
        </Button>
      )}

      {/* Dialog para cancelar reserva */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Cancelar Reserva
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La reserva #{booking.reserva_id} será cancelada permanentemente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="cancel-reason">
                Razón de la cancelación *
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="Proporcione el motivo de la cancelación..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setCancelDialogOpen(false);
                setCancelReason('');
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={loading || !cancelReason.trim()}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Confirmar Cancelación
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para cambiar estado */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Cambiar Estado
            </DialogTitle>
            <DialogDescription>
              Seleccione el nuevo estado para la reserva #{booking.reserva_id}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="new-status">
                Nuevo Estado
              </Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="confirmada">Confirmada</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setStatusDialogOpen(false);
                setNewStatus('');
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleStatusUpdate}
              disabled={loading || !newStatus}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Actualizar Estado
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
