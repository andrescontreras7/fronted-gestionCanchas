"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import CourtsDetail from "./courtsDetail";
import { createBooking } from "@/lib/server-actions";

const CourtsDetailContainer = ({ courtsDetail, role }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReservar = async ({
    dia,
    hora_inicio,
    hora_fin,
    disponibilidad_id,
    anotaciones,
  }) => {
    console.log(
      "Reservando cancha:",
      courtsDetail.cancha_id,
      dia,
      hora_inicio,
      hora_fin,
      disponibilidad_id,
      anotaciones
    );
    setLoading(true);
    try {
      const [year, month, day] = dia.split("-");
      const fechaInicio = new Date(`${dia}T${hora_inicio}`);
      const fechaFin = new Date(`${dia}T${hora_fin}`);

      const reservaData = {
        cancha_id: courtsDetail.cancha_id,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        notas: anotaciones || undefined,
        disponibilidad_id: disponibilidad_id,
      };

      await createBooking(reservaData);

      toast.success("Reserva creada con éxito");
      router.push("/user/bookings");
    } catch (error) {
      console.error("Error al crear la reserva:", error);
      toast.error(error.message || "Error al crear la reserva");
    } finally {
      setLoading(false);
    }
  };
  const handleEditar = () => {
    console.log("Editando cancha:", courtsDetail.cancha_id);
    router.push(`/admin/courts/${courtsDetail.cancha_id}/edit`);
  };

  const handleEliminar = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta cancha?")) {
      return;
    }

    setLoading(true);
    try {
      alert("Cancha eliminada exitosamente");
      router.push("/admin/courts");
    } catch (error) {
      console.error("Error al eliminar cancha:", error);
      alert("Error al eliminar la cancha");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDisponibilidad = async () => {
    setLoading(true);
    try {
      console.log(
        "Toggling disponibilidad para cancha:",
        courtsDetail.cancha_id
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert(
        `Cancha marcada como ${
          !courtsDetail.disponible ? "disponible" : "no disponible"
        }`
      );
      router.refresh();
    } catch (error) {
      console.error("Error al actualizar disponibilidad:", error);
      alert("Error al actualizar la disponibilidad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CourtsDetail
      courtsDetail={courtsDetail}
      role={role}
      loading={loading}
      onReservar={handleReservar}
      onEditar={handleEditar}
      onEliminar={handleEliminar}
      onToggleDisponibilidad={handleToggleDisponibilidad}
    />
  );
};

export default CourtsDetailContainer;
