"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { updateUserRole, updateUserPermissions, deleteUser, updateUserData } from "@/lib/server-actions"
import { PERMISSIONS } from "@/lib/permissions"
import { usePermissions } from "@/hooks/api-hooks"
import { Edit, Shield, Trash2, X, Check } from "lucide-react"

export function UserActions({ user,roles, onAction }) {
  const { fetchUserPermissions, assignPermission, revokePermission, fetchAllPermissions } = usePermissions()
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  
  const [selectedRole, setSelectedRole] = useState(user.role || user.role_uid || '')
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [originalPermissions, setOriginalPermissions] = useState([]) // Para comparar cambios
  const [availablePermissions, setAvailablePermissions] = useState([]) // Todos los permisos disponibles
  
  // Estados para editar datos del usuario
  const [userData, setUserData] = useState({
    username: user.username || '',
    email: user.email || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
  })

  const handleEditClick = () => {
    // Resetear los datos cuando se abre el modal
    setUserData({
      username: user.username || '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
    })
    setSelectedRole(user.role || user.role_uid || '')
    setIsEditModalOpen(true)
  }

  const handlePermissionsClick = async () => {
    setIsPermissionsModalOpen(true)
    setLoadingPermissions(true)
    
    try {
      const userPermissions = await fetchUserPermissions(user.uid)
      const allPerms = await fetchAllPermissions()

      // Los permisos del usuario ya vienen como strings
      const permissionsArray = userPermissions
      
      // Los permisos disponibles ya vienen como objetos
      const availableArray = allPerms
    
      setSelectedPermissions(permissionsArray)
      setOriginalPermissions([...permissionsArray])
      setAvailablePermissions(availableArray)
      
    } catch (error) {
      // Fallback simple
      const fallbackPermissions = (user.permissions || []).map(p => p.name || p)
      const fallbackAvailable = Object.values(PERMISSIONS).map(p => ({
        name: p,
        description: '',
        uid: p
      }))
      
      setSelectedPermissions(fallbackPermissions)
      setOriginalPermissions([...fallbackPermissions])
      setAvailablePermissions(fallbackAvailable)
    } finally {
      setLoadingPermissions(false)
    }
  }

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true)
  }

  const handleUpdateRole = async () => {
    setIsLoading(true)
    try {
      await updateUserRole(user.uid, selectedRole)
      setIsEditModalOpen(false)
      if (onAction) onAction('role_updated')
    } catch (error) {
      console.error('Error actualizando rol:', error)
      alert('Error al actualizar el rol del usuario')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUserData = async () => {
    setIsLoading(true)
    try {
      await updateUserData(user.uid, userData)
      setIsEditModalOpen(false)
      if (onAction) onAction('user_updated')
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      alert('Error al actualizar los datos del usuario')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleRoleChange = (roleUid) => {
    setSelectedRole(roleUid)
  }


  const handleUpdatePermissions = async () => {
    setIsLoading(true)
    try {

      const permissionsToAdd = selectedPermissions.filter(p => !originalPermissions.includes(p))
      const permissionsToRemove = originalPermissions.filter(p => !selectedPermissions.includes(p))

      for (const permission of permissionsToAdd) {
        try {
          await assignPermission(user.uid, permission)
         
        } catch (error) {
          throw new Error(`Error asignando permiso ${permission}: ${error.message}`)
        }
      }
      

      for (const permission of permissionsToRemove) {
        try {
          await revokePermission(user.uid, permission)
        } catch (error) {
          console.error(' Error revocando permiso:', permission, error)
        }
      }
      
      setIsPermissionsModalOpen(false)
    
      if (onAction) onAction('permissions_updated')
    } catch (error) {
   
      alert('Error al actualizar los permisos del usuario')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    setIsLoading(true)
    try {
      await deleteUser(user.uid)
      setIsDeleteModalOpen(false)
      if (onAction) onAction('user_deleted')
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      alert('Error al eliminar el usuario')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePermission = (permissionName) => {
    setSelectedPermissions(prev => {
      const newPermissions = prev.includes(permissionName)
        ? prev.filter(p => p !== permissionName)
        : [...prev, permissionName]
      
      return newPermissions
    })
  }

  const getPermissionSource = (permission) => {
 
    return originalPermissions.includes(permission) ? 'actual' : 'nuevo'
  }


  const formatPermissionName = (permission) => {
    if (!permission || typeof permission !== 'string') {
      return 'Permiso desconocido'
    }
    
    try {
      return permission
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim()
    } catch (error) {
      return permission
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
       
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleEditClick}
        >
          <Edit className="h-4 w-4 mr-1" />
          Editar
        </Button>

        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePermissionsClick}
        >
          <Shield className="h-4 w-4 mr-1" />
          Permisos
        </Button>


        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>


      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modificar la información del usuario {user.username}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 
            <div>
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                value={userData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Nombre de usuario"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Email"
              />
            </div>
            <div>
              <Label htmlFor="first_name">Nombre</Label>
              <Input
                id="first_name"
                value={userData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Nombre"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Apellido</Label>
              <Input
                id="last_name"
                value={userData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Apellido"
              />
            </div>

         
            <div>
              <Label htmlFor="role">Rol</Label>
              <Select 
                value={selectedRole} 
                onValueChange={handleRoleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {
                    roles ? roles.map(role => (
                      <SelectItem key={role.uid} value={role.uid}>
                        {role.name}
                      </SelectItem>
                    )) : null
                  }
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                setIsLoading(true)
                try {
                  // Actualizar datos del usuario
                  await handleUpdateUserData()
                  
                  // Actualizar rol si cambió
                  if (selectedRole && selectedRole !== (user.role || user.role_uid)) {
                    await handleUpdateRole()
                  }
                } catch (error) {
                  console.error('Error actualizando usuario:', error)
                } finally {
                  setIsLoading(false)
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Permisos */}
      <Dialog open={isPermissionsModalOpen} onOpenChange={setIsPermissionsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gestionar Permisos</DialogTitle>
            <DialogDescription>
              Configurar permisos para {user.username}
            </DialogDescription>
          </DialogHeader>
          
          {loadingPermissions ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Cargando permisos...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Permisos actuales: <strong>{selectedPermissions.length}</strong></span>
                  <span>Total disponibles: <strong>{availablePermissions.length}</strong></span>
                </div>
                <div className="mt-2 text-xs">
                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-2">✓ Asignado</span>
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">+ Nuevo</span>
                  <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded">- Quitar</span>
                </div>
              </div>
              
              {availablePermissions.map((permissionObj) => {
                // Validar que el permiso existe y tiene name
                if (!permissionObj || !permissionObj.name) {
                  return null
                }
                
                const permissionName = permissionObj.name
                const isSelected = selectedPermissions.includes(permissionName)
                const wasOriginal = originalPermissions.includes(permissionName)
                const isNew = isSelected && !wasOriginal
                const willBeRemoved = !isSelected && wasOriginal
                
                return (
                  <div key={permissionObj.uid || permissionName} className={`flex items-center space-x-2 p-2 rounded-lg border ${
                    isNew ? 'bg-blue-50 border-blue-200' : 
                    willBeRemoved ? 'bg-red-50 border-red-200' : 
                    isSelected ? 'bg-green-50 border-green-200' : 
                    'bg-white border-gray-200'
                  }`}>
                    <Checkbox
                      id={permissionObj.uid || permissionName}
                      checked={isSelected}
                      onCheckedChange={() => togglePermission(permissionName)}
                      disabled={loadingPermissions}
                    />
                    <div className="flex-1">
                      <Label htmlFor={permissionObj.uid || permissionName} className="text-sm font-medium cursor-pointer">
                        {permissionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                      {permissionObj.description && (
                        <p className="text-xs text-gray-500 mt-1">{permissionObj.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {isNew && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Nuevo</span>}
                      {willBeRemoved && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Quitar</span>}
                      {isSelected && !isNew && <Check className="h-4 w-4 text-green-600" />}
                    </div>
                  </div>
                )
              }).filter(Boolean)}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPermissionsModalOpen(false)
                setSelectedPermissions([]) // Limpiar estado al cerrar
              }}
              disabled={isLoading || loadingPermissions}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdatePermissions}
              disabled={isLoading || loadingPermissions}
            >
              {isLoading ? 'Guardando...' : 'Guardar Permisos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Eliminación */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar al usuario <strong>{user.username}</strong>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isLoading}
            >
              {isLoading ? 'Eliminando...' : 'Eliminar Usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
