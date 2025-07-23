"use client";

import { useAuthForm } from "@/modules/auth/hooks/use-auth-form.jsx";
import { useState, useEffect, createContext, useContext } from "react";

const PermissionsContext = createContext({
  permissions: [],
  hasPermission: () => false,
  isLoading: true,
  userRole: null,
});

export const usePermissions = () => {
  const context = useContext(PermissionsContext);

  return context;
};

export function PermissionsProvider({ children }) {
  const { getPermission } = useAuthForm();
  const [permissions, setPermissions] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const role = localStorage.getItem("user_role");
        const userData = JSON.parse(localStorage.getItem("user_data"));

        if (!token) {
          console.log("Sin token, saliendo pa");
          setIsLoading(false);
          return;
        }

        if (!role) {
          console.log("Sin rol pero con token, intentando obtener permisos...");
        } else {
          setUserRole(role);
        }

        const uid = userData?.uid || userData?.id || null;

        const data = await getPermission(uid);
        setPermissions(data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();

    const handleStorageChange = () => {
      fetchPermissions();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const hasPermission = (permission) => {
    if (!permissions || permissions.length === 0) return false;
    return permissions.includes(permission);
  };

  const hasAllPermissions = (requiredPermissions) => {
    if (!Array.isArray(requiredPermissions)) return false;
    return requiredPermissions.every((permission) => hasPermission(permission));
  };

  const hasAnyPermission = (requiredPermissions) => {
    if (!Array.isArray(requiredPermissions)) return false;
    return requiredPermissions.some((permission) => hasPermission(permission));
  };

  const value = {
    permissions,
    userRole,
    isLoading,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function useUserPermissions() {
  const { permissions } = usePermissions();
  return permissions;
}
