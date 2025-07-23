'use client';

import React, { useState, useEffect } from 'react';
import { getCourtCalendar, getAvailableBlocks } from '@/lib/booking-actions';
import { formatTimeToAMPM } from '@/lib/time-utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function CourtCalendar({ canchaId, onSelectTimeSlot }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // Cargar calendario del mes
  useEffect(() => {
    const loadCalendar = async () => {
      setLoading(true);
      try {
        const data = await getCourtCalendar(canchaId, year, month);
        console.log('📅 Datos del calendario recibidos:', data);
        setCalendarData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error cargando calendario:', error);
        setCalendarData([]);
      } finally {
        setLoading(false);
      }
    };

    if (canchaId) {
      loadCalendar();
    }
  }, [canchaId, year, month]);

  // Cargar bloques disponibles cuando se selecciona una fecha
  const handleDateClick = async (day) => {
    const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setSelectedDate(dateString);
    setLoadingBlocks(true);
    
    console.log('🔍 Cargando bloques para:', { canchaId, dateString });
    
    try {
      const blocks = await getAvailableBlocks(canchaId, dateString);
      console.log('✅ Bloques recibidos:', blocks);
      setAvailableBlocks(blocks);
    } catch (error) {
      console.error('❌ Error cargando bloques:', error);
      setAvailableBlocks([]);
    } finally {
      setLoadingBlocks(false);
    }
  };

  // Navegar meses
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
    setAvailableBlocks([]);
  };

  // Generar días del calendario
  const generateCalendarDays = () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentMonth = month - 1;

    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      
      // Buscar datos del día en el calendario
      let dayData = null;
      if (Array.isArray(calendarData) && calendarData.length > 0) {
        dayData = calendarData.find(d => {
          // Manejar diferentes formatos de fecha
          if (d.fecha) {
            const dateStr = typeof d.fecha === 'string' ? d.fecha : d.fecha.split('T')[0];
            const calendarDate = `${year}-${month.toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`;
            return dateStr === calendarDate;
          } else if (d.day && typeof d.day === 'number') {
            return d.day === day.getDate() && day.getMonth() === currentMonth;
          }
          return false;
        });
      }
      
      days.push({
        date: day,
        day: day.getDate(),
        isCurrentMonth: day.getMonth() === currentMonth,
        isAvailable: dayData?.disponible || dayData?.available || false,
        isPast: day < new Date().setHours(0, 0, 0, 0),
        bloques_libres: dayData?.bloques_libres || 0
      });
    }

    console.log('📊 Días generados:', { 
      totalDays: days.length, 
      availableDays: days.filter(d => d.isAvailable).length,
      calendarDataLength: calendarData.length 
    });

    return days;
  };

  return (
    <div className="space-y-4">
      {/* Header del calendario */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Seleccionar Fecha
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[120px] text-center">
                {MONTHS[month - 1]} {year}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando calendario...</div>
          ) : (
            <div>
              {/* Info del calendario */}
              {calendarData.length === 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    <strong>⚠️ No hay horarios configurados</strong>
                    <p className="mt-1">
                      Esta cancha no tiene horarios disponibles configurados. 
                      {/* Solo mostrar el enlace si el usuario es admin */}
                      <span className="block mt-1 text-yellow-700">
                        Contacte al administrador para configurar los horarios.
                      </span>
                    </p>
                  </div>
                </div>
              )}
              
              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((dayInfo, index) => (
                  <button
                    key={index}
                    onClick={() => dayInfo.isCurrentMonth && dayInfo.isAvailable && !dayInfo.isPast && handleDateClick(dayInfo.day)}
                    disabled={!dayInfo.isCurrentMonth || !dayInfo.isAvailable || dayInfo.isPast}
                    className={`
                      p-2 text-sm rounded-md transition-colors
                      ${!dayInfo.isCurrentMonth ? 'text-muted-foreground/30' : ''}
                      ${dayInfo.isPast ? 'text-muted-foreground/50 cursor-not-allowed' : ''}
                      ${dayInfo.isAvailable && dayInfo.isCurrentMonth && !dayInfo.isPast 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                      ${selectedDate === `${year}-${month.toString().padStart(2, '0')}-${dayInfo.day.toString().padStart(2, '0')}` 
                        ? 'ring-2 ring-blue-500 bg-blue-100 text-blue-800' 
                        : ''
                      }
                    `}
                  >
                    {dayInfo.day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Horarios disponibles */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios Disponibles - {selectedDate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBlocks ? (
              <div className="text-center py-4">Cargando horarios...</div>
            ) : availableBlocks.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No hay horarios disponibles para esta fecha.
              </div>
            ) : (
              <>
                {/* Mensaje informativo si es hoy y hay horarios filtrados */}
                {selectedDate === new Date().toISOString().split('T')[0] && 
                 availableBlocks.some(block => {
                   const blockTime = new Date(`${selectedDate}T${block.hora_inicio}`);
                   return blockTime <= new Date();
                 }) && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    ℹ️ Solo se muestran los horarios futuros disponibles para hoy.
                  </div>
                )}
                
                {(() => {
                  // Filtrar bloques que ya pasaron si es hoy
                  const filteredBlocks = availableBlocks.filter(block => {
                    if (selectedDate === new Date().toISOString().split('T')[0]) {
                      const now = new Date();
                      const blockTime = new Date(`${selectedDate}T${block.hora_inicio}`);
                      return blockTime > now;
                    }
                    return true;
                  });

                  if (filteredBlocks.length === 0) {
                    return (
                      <div className="text-center py-4 text-muted-foreground">
                        {selectedDate === new Date().toISOString().split('T')[0] 
                          ? "No hay horarios futuros disponibles para hoy."
                          : "No hay horarios disponibles para esta fecha."
                        }
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {filteredBlocks.map((block, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="flex flex-col items-center p-4 h-auto"
                          onClick={() => onSelectTimeSlot({
                            fecha: selectedDate,
                            hora_inicio: block.hora_inicio,
                            hora_fin: block.hora_fin
                            // NO enviar bloque_id porque no se usa en el backend
                          })}
                        >
                          <span className="font-mono text-sm">
                            {formatTimeToAMPM(block.hora_inicio)} - {formatTimeToAMPM(block.hora_fin)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {block.hora_inicio} - {block.hora_fin}
                          </span>
                          {block.precio && (
                            <Badge variant="secondary" className="mt-1">
                              ${block.precio}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  );
                })()}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
