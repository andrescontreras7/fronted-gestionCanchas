"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function getUserPermissions() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/user-permissions/my-permissions`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener permisos: ${response.statusText}`);
  }

  return response.json();
}

async function getSpecificUserPermissions(userId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  // Usar el endpoint específico que incluye permisos del rol + individuales
  const url = `${API_BASE_URL}/user-permissions/user/${userId}/all`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error al obtener permisos del usuario: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
}

async function getAllPermissions() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/permissions/list-permissions`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error al obtener lista de permisos: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
}

async function assignPermissionToUser(userId, permissionName) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/user-permissions/grant`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_id: userId,
      permission_names: [permissionName],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error asignando permiso: ${response.statusText} - ${errorText}`
    );
  }

  const data = await response.json();
  return data;
}

async function revokePermissionFromUser(userId, permissionName) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/user-permissions/revoke?user_id=${userId}&permission_name=${permissionName}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error revocando permiso: ${response.statusText} - ${errorText}`
    );
  }

  const data = await response.json();
  return data;
}

async function getUsers() {
  try {
    // Leer el token desde las cookies del servidor
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/admin/users/`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Token incluido automáticamente
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    return [];
  }
}

async function createBooking(bookingData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/reservas/create`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error al crear reserva: ${response.statusText} - ${errorText}`
    );
  }

  const result = await response.json();

  // Revalidar las rutas relacionadas con reservas
  revalidatePath("/user/bookings");
  revalidatePath("/admin/bookings");

  return result;
}

async function deactivateUser(userId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/admin/users/${userId}/deactivate`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al desactivar usuario: ${response.statusText}`);
  }

  // Revalidar la página para actualizar los datos
  revalidatePath("/admin/usuarios");
}

async function activateUser(userId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/admin/users/${userId}/activate`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al activar usuario: ${response.statusText}`);
  }

  // Revalidar la página para actualizar los datos
  revalidatePath("/admin/usuarios");
}

async function deleteUser(userId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/admin/users/${userId}/`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al eliminar usuario: ${response.statusText}`);
  }

  // Revalidar la página para actualizar los datos
  revalidatePath("/admin/usuarios");
}

async function updateUserRole(userId, roleUid) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/roles/assign-role-by-uid`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId, role_uid: roleUid }),
  });

  if (!response.ok) {
    throw new Error(`Error al actualizar rol: ${response.statusText}`);
  }

  // Revalidar la página para actualizar los datos
  revalidatePath("/admin/usuarios");
}

async function getDetailsCourts(courtId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/canchas/${courtId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener las canchas: ${response.statusText}`);
  }

  return response.json();
}

async function getAvailabilityCourts(courtId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/canchas/disponibilidad/cancha/${courtId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error al obtener la disponibilidad de la cancha: ${response.statusText}`
    );
  }

  return response.json();
}

async function getDetailsBooking(bookingId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/reservas/${bookingId}/completa`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener las reservas: ${response.statusText}`);
  }

  return response.json();
}

async function getDetailsBookingByUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/reservas/mis-reservas`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error al obtener las reservas asociasdas al usuario: ${response.statusText}`
    );
  }

  return response.json();
}

async function getRoles() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/roles/list-roles`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error al obtener roles: ${response.statusText}`);
  }
  return response.json();
}

async function getCourts() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/canchas/`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error al obtener roles: ${response.statusText}`);
  }
  return response.json();
}

async function getBookings() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/reservas/`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error al obtener roles: ${response.statusText}`);
  }
  return response.json();
}

async function updateUserPermissions(userId, permissions) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/user-permissions/grant`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ permission_names: permissions, user_id: userId }),
  });

  if (!response.ok) {
    throw new Error(`Error al actualizar permisos: ${response.statusText}`);
  }

  // Revalidar la página para actualizar los datos
  revalidatePath("/admin/usuarios");
}

async function handleUserActions(action, userIds) {
  "use server";

  try {
    for (const userId of ids) {
      switch (action) {
        case "activate":
          await activateUser(userId);
          break;
        case "deactivate":
          await deactivateUser(userId);
          break;
        case "delete":
          await deleteUser(userId);

          break;
        case "toggle":

        default:
          break;
      }
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
}

async function getDashboardStats() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/admin/dashboard/stats`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener estadísticas: ${response.statusText}`);
  }

  return response.json();
}

async function getRecentActivity() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/admin/dashboard/activity`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error al obtener actividad reciente: ${response.statusText}`
    );
  }

  return response.json();
}

async function getUserDashboardStats(userId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/user/dashboard/stats${
    userId ? `?user_id=${userId}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error al obtener estadísticas del usuario: ${response.statusText}`
    );
  }

  return response.json();
}

async function cancelBooking(bookingId, reason = "") {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/reservas/${bookingId}/cancel`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error al cancelar reserva: ${response.statusText} - ${errorText}`
    );
  }

  const result = await response.json();

  revalidatePath("/user/bookings");
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);

  return result;
}

async function updateBookingStatus(bookingId, newStatus) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const url = `${API_BASE_URL}/reservas/${bookingId}/status`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ estado: newStatus }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error al actualizar estado: ${response.statusText} - ${errorText}`
    );
  }

  const result = await response.json();

  // Revalidar las rutas relacionadas con reservas
  revalidatePath("/user/bookings");
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);

  return result;
}

async function updateUserData(userId, userData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      throw new Error("No hay token de autenticación disponible");
    }

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const url = `${API_BASE_URL}/admin/users/${userId}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error al actualizar usuario: ${response.statusText}`);
    }

    const result = await response.json();

    revalidatePath("/admin/users");

    return result;
  } catch (error) {
    throw error;
  }
}

export {
  getUsers,
  getDetailsBookingByUser,
  getAvailabilityCourts,
  getBookings,
  getDetailsBooking,
  deactivateUser,
  getRoles,
  getCourts,
  createBooking,
  cancelBooking,
  updateBookingStatus,
  getDashboardStats,
  getRecentActivity,
  getUserDashboardStats,
  getDetailsCourts,
  activateUser,
  getUserPermissions,
  getSpecificUserPermissions,
  getAllPermissions,
  assignPermissionToUser,
  revokePermissionFromUser,
  deleteUser,
  updateUserRole,
  updateUserPermissions,
  handleUserActions,
  updateUserData,
};
