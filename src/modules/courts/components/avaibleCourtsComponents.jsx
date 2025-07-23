import { getAvailabilityCourts } from '@/lib/server-actions';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const DIAS_ORDENADOS = [
  'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'
];

const DisponibilidadCancha = ({ canchaId, onReservar }) => {
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reservando, setReservando] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  const [anotaciones, setAnotaciones] = useState("");
  const [open, setOpen] = useState(false);

  const resetStates = () => {
    setDiaSeleccionado(null);
    setHorarioSeleccionado(null);
    setAnotaciones("");
  };

  const handleOpen = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetStates();
    }
  };

  const handleReservar = async () => {
    if (!horarioSeleccionado || !diaSeleccionado) {
      toast.error("Por favor selecciona un horario para reservar");
      return;
    }

    setReservando(true);


    const user = JSON.parse(localStorage.getItem('user_data')); // Asumiendo que el usuario está guardado en localStorage
 
    try {
      await onReservar({
        dia: diaSeleccionado,
        hora_inicio: horarioSeleccionado.hora_inicio,
        hora_fin: horarioSeleccionado.hora_fin,
        disponibilidad_id: horarioSeleccionado.disponibilidad_id,
        notas: anotaciones.trim(),
        user_email: user.email,
        user_nombre: user.username


      });
      toast.success("Reserva realizada con éxito");
      setOpen(false);
      // Recargar disponibilidad
      fetchAvailability();
    } catch (error) {
      toast.error(error.message || "Error al realizar la reserva");
    } finally {
      setReservando(false);
    }
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const availability = await getAvailabilityCourts(canchaId);
        setDisponibilidad(availability || []);
      } catch (error) {
        setDisponibilidad([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [canchaId]);


  const dias = {};
  disponibilidad.forEach(item => {
    if (!dias[item.dia_semana]) dias[item.dia_semana] = [];
    dias[item.dia_semana].push(item);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          Ver Disponibilidad
        </Button>
      </DialogTrigger>
    <DialogContent className="max-w-[95vw] md:max-w-2xl w-full max-h-[90vh] p-0 flex flex-col overflow-hidden">
  {/* Header */}
  <DialogHeader className="p-6 pb-2 shrink-0">
    <DialogTitle>Calendario de Disponibilidad</DialogTitle>
    <DialogDescription>
      Consulta los días y horarios disponibles para reservar esta cancha.
    </DialogDescription>
  </DialogHeader>

  {/* Contenido scrollable */}
  <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-6">
    {loading ? (
      <div className="text-center py-4">Cargando disponibilidad...</div>
    ) : !disponibilidad.length ? (
      <div className="text-center py-4">No hay disponibilidad para esta cancha.</div>
    ) : (
      <>
        {/* Selector de días */}
        <ScrollArea className="w-full">
          <div className="flex gap-2 px-1 pb-2">
            {DIAS_ORDENADOS.map(dia => (
              <Button
                key={dia}
                variant={diaSeleccionado === dia ? "default" : "outline"}
                className={`capitalize px-3 py-2 font-semibold min-w-[100px] whitespace-nowrap ${!dias[dia] ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!dias[dia]}
                onClick={() => setDiaSeleccionado(dia)}
              >
                {dia}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Horarios por día */}
        {diaSeleccionado && dias[diaSeleccionado] ? (
          <Card>
            <CardContent className="p-4">
              <Badge variant="outline" className="capitalize mb-4 text-base">
                {diaSeleccionado}
              </Badge>
              <ScrollArea className="h-[250px] pr-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                  {dias[diaSeleccionado].map(slot => (
                    <Button
                      key={slot.disponibilidad_id}
                      variant={horarioSeleccionado?.disponibilidad_id === slot.disponibilidad_id ? "default" : "ghost"}
                      className={`flex flex-col items-center justify-center p-2 h-24 ${
                        slot.estado === 'disponible' ? 'hover:bg-primary/10' : 'opacity-60'
                      }`}
                      disabled={slot.estado !== 'disponible'}
                      onClick={() => setHorarioSeleccionado(slot.estado === 'disponible' ? slot : null)}
                    >
                      <span className="font-mono font-bold text-base">{slot.hora_inicio.slice(0, 5)}</span>
                      <span className="font-mono text-xs">{slot.hora_fin.slice(0, 5)}</span>
                      <Badge
                        variant={slot.estado === 'disponible' ? "secondary" : "destructive"}
                        className="mt-1"
                      >
                        {slot.estado === 'disponible' ? 'Disponible' : 'Ocupado'}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            Selecciona un día para ver los horarios disponibles.
          </div>
        )}

        {/* Detalles de reserva */}
        {horarioSeleccionado && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Detalles de la Reserva</h3>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Día:</span>
                    <Badge variant="outline" className="capitalize">{diaSeleccionado}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horario:</span>
                    <Badge variant="outline">
                      {horarioSeleccionado.hora_inicio.slice(0, 5)} - {horarioSeleccionado.hora_fin.slice(0, 5)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="anotaciones">Anotaciones (opcional)</Label>
                <Textarea
                  id="anotaciones"
                  placeholder="Agrega cualquier nota o requerimiento especial para tu reserva..."
                  value={anotaciones}
                  onChange={(e) => setAnotaciones(e.target.value)}
                  className="h-24"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </>
    )}
  </div>

  {/* Footer fijo abajo */}
  <div className="border-t shrink-0">
    <DialogFooter className="p-6 pt-4">
      <div className="w-full flex justify-between items-center gap-4">
        {horarioSeleccionado && (
          <Button
            variant="outline"
            onClick={() => {
              setHorarioSeleccionado(null);
              setAnotaciones("");
            }}
            disabled={reservando}
          >
            Cambiar Horario
          </Button>
        )}
        <Button
          onClick={handleReservar}
          disabled={!horarioSeleccionado || reservando}
          className={horarioSeleccionado ? "ml-auto" : "w-full"}
        >
          {reservando ? "Reservando..." : "Confirmar Reserva"}
        </Button>
      </div>
    </DialogFooter>
  </div>
</DialogContent>



    </Dialog>
  );
};


export default DisponibilidadCancha;