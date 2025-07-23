

import { getUsers,getRoles,  handleUserActions } from '@/lib/server-actions';
import { UserManagement } from '@/modules/admin';

export default async function UsuariosPage() {
  let users = []
  let roles = []
  try {
    users = await getUsers()
    roles = await getRoles()
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  }

  return <UserManagement bulkActions={handleUserActions} roles={roles} users={users} />
}
          

