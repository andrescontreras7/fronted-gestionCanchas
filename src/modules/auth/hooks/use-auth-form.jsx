import { useAuth, useUsers, usePermissions } from "@/hooks/api-hooks";

export function useAuthForm() {
  const authHook = useAuth();
  const usersHook = useUsers();
  const permissionsHook = usePermissions();
  const handleLogin = async (formData) => {
    return await authHook.login(formData);
  };

  const handleRegister = async (formData) => {
    return await authHook.register(formData);
  };

  const handleLogout = async () => {
    return await authHook.logout();
  };

  const getUsers = async () => {
    return await usersHook.fetchUsers();
  };

  const getPermission = async (uid) => {
    return await permissionsHook.fetchMyPermissions(uid);
  };

  const handlePasswordReset = async (email) => {
    return await authHook.requestPasswordReset(email);
  };

  return {
    isLoading:
      authHook.isLoading || usersHook.isLoading || permissionsHook.isLoading,
    error: authHook.error || usersHook.error || permissionsHook.error,
    handleLogin,
    handleRegister,
    handleLogout,
    handlePasswordReset,
    getUsers,
    getPermission,

    clearError: () => {
      authHook.clearError();
      usersHook.clearError();
      permissionsHook.clearError();
    },
  };
}
