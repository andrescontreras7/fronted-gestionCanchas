"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  clientAuthService,
  clientUsersService,
  clientPermissionsService,
  handleClientError,
} from "@/services/client-api.service";
import { storage } from "@/shared/utils/storage.utils";
import { toast } from "sonner";
import { PERMISSIONS } from "@/lib/permissions";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const redirectByRole = (role) => {
    switch (role) {
      case "administrador":
        router.push("/admin/dashboard");
        break;
      case "gerente":
        router.push("/gerente/dashboard");
        break;
      case "empleado":
        router.push("/empleado/dashboard");
        break;
      case "usuario":
      default:
        router.push("/user/dashboard");
    }
  };

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientAuthService.login(credentials);
      const role = storage.getUserRole();
      redirectByRole(role);
      return response;
    } catch (err) {
      const errorMessage = handleClientError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData, shouldRedirect = true) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientAuthService.register(userData);

      toast.success(
        shouldRedirect
          ? "Registro exitoso. Por favor inicia sesión"
          : "Usuario creado exitosamente"
      );

      if (shouldRedirect) {
        router.push("/");
      }

      return response;
    } catch (err) {
      const errorMessage = handleClientError(err);
      setError(errorMessage);
      toast.error(errorMessage || "Error al registrar usuario");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      await clientAuthService.logout();
      router.push("/");
    } catch (err) {
      console.error("Error durante logout:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientAuthService.updateProfile(profileData);
      return response;
    } catch (err) {
      const errorMessage = handleClientError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientAuthService.changePassword(passwordData);
      return response;
    } catch (err) {
      const errorMessage = handleClientError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError: () => setError(null),
  };
}

export function useUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientUsersService.getAllUsers();
      setUsers(response.users || response);
      return response;
    } catch (err) {
      const errorMessage = handleClientError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId, userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientUsersService.updateUser(userId, userData);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, ...userData } : user
        )
      );
      return response;
    } catch (err) {
      const errorMessage = handleClientError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateUser = async (userId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientUsersService.deactivateUser(userId);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_active: false } : user
        )
      );
      return response;
    } catch (err) {
      const errorMessage = handleClientError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const activateUser = async (userId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientUsersService.activateUser(userId);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_active: true } : user
        )
      );
      return response;
    } catch (err) {
      const errorMessage = handleClientError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    users,
    fetchUsers,
    updateUser,
    deactivateUser,
    activateUser,
    clearError: () => setError(null),
  };
}

export function usePermissions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]); // Lista completa de permisos

  const fetchMyPermissions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientPermissionsService.getMyPermissions();
      setPermissions(response.permissions || response);
      return response;
    } catch (err) {
      const errorMessage = handleClientError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPermissions = async (userId) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Obteniendo permisos completos para usuario:", userId);
      const response = await clientPermissionsService.getUserPermissions(
        userId
      );
      let userPermissions = [];

      if (Array.isArray(response)) {
        userPermissions = response;
      } else if (response && typeof response === "object") {
        userPermissions =
          response.permissions ||
          response.all_permissions ||
          response.user_permissions ||
          response.data ||
          [];
      }

      const validPermissions = Array.isArray(userPermissions)
        ? userPermissions.filter(
            (p) => p && typeof p === "string" && p.trim().length > 0
          )
        : [];
      return validPermissions;
    } catch (err) {
      const errorMessage = handleClientError(err);
      setError(errorMessage);
      console.error(" Error obteniendo permisos del usuario:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllPermissions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Obteniendo lista completa de permisos");
      const response = await clientPermissionsService.getAllPermissions();
      console.log("📋 Lista de permisos:", response);

      // Tu endpoint devuelve un array de objetos con {name, description, uid}
      let permissionsList = [];

      if (Array.isArray(response)) {
        permissionsList = response;
      } else if (response && typeof response === "object") {
        permissionsList =
          response.permissions || response.data || response.results || [];
      }
      const validPermissions = Array.isArray(permissionsList)
        ? permissionsList.filter((p) => {
            return (
              p && typeof p === "object" && p.name && typeof p.name === "string"
            );
          })
        : [];

      setAllPermissions(validPermissions);
      return validPermissions;
    } catch (err) {
      const errorMessage = handleClientError(err);
      setError(errorMessage);
      console.error("❌ Error obteniendo lista de permisos:", err);
      // Fallback a constantes locales
      const fallbackPermissions = Object.values(PERMISSIONS).map((p) => ({
        name: p,
        description: "",
        uid: p,
      }));
      setAllPermissions(fallbackPermissions);
      return fallbackPermissions;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPermissions = async (userId, newPermissions) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientPermissionsService.updateUserPermissions(
        userId,
        newPermissions
      );
      return response;
    } catch (err) {
      const errorMessage = handleClientError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const assignPermission = async (userId, permissionName) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientPermissionsService.assignPermissionToUser(
        userId,
        permissionName
      );

      return response;
    } catch (err) {
      const errorMessage = handleClientError(err);
      setError(errorMessage);
      console.error(" Error asignando permiso:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const revokePermission = async (userId, permissionName) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientPermissionsService.revokePermissionFromUser(
        userId,
        permissionName
      );
  
      return response;
    } catch (err) {
      const errorMessage = handleClientError(err);
      setError(errorMessage);
      console.error("❌ Error revocando permiso:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    permissions,
    allPermissions,
    fetchMyPermissions,
    fetchUserPermissions,
    fetchAllPermissions,
    updateUserPermissions,
    assignPermission,
    revokePermission,
    clearError: () => setError(null),
  };
}

export function useUIState() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("light");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const openProfileModal = () => setProfileModalOpen(true);
  const closeProfileModal = () => setProfileModalOpen(false);
  const toggleTheme = () =>
    setCurrentTheme((prev) => (prev === "light" ? "dark" : "light"));

  return {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    profileModalOpen,
    openProfileModal,
    closeProfileModal,
    currentTheme,
    toggleTheme,
  };
}
