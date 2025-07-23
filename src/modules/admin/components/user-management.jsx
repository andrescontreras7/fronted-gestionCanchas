"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProtectedComponent, ProtectedButton } from "@/components/ProtectedComponent"
import { PERMISSIONS } from "@/lib/permissions"
import { useUserPermissions } from "@/hooks/usePermision"
import { 
  Plus, 
  Download, 
  Check, 
  X, 
  Trash2, 
  Edit, 
  AlertTriangle,
  Users,
  UserCheck,
  UserX,
  Search,
  Shield
} from "lucide-react"
import { UserActions } from "./user-actions"
import { activateUser, deactivateUser } from "@/lib/server-actions"
import { NewUserModal } from "./new-user-modal"

export function UserManagement({ users, roles, bulkActions }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false)


  const userList = Array.isArray(users) ? users : []

  const filteredUsers = userList.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )


  const stats = {
    totalUsers: userList.length,
    activeUsers: userList.filter(user => user.is_active !== false).length,
    inactiveUsers: userList.filter(user => user.is_active === false).length,
    filteredCount: filteredUsers.length
  }

  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert('Selecciona al menos un usuario')
      return
    }

    if (bulkActions) {
      try {
        await bulkActions(action, selectedUsers)
      } catch (error) {
        console.error('Error ejecutando acción:', error)
        alert('Error al ejecutar la acción')
      }
    }
    setSelectedUsers([])
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
  }

  return (
    <div className="space-y-8">
    
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-2">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        <div className="flex gap-2">
         
          <ProtectedComponent permissions={PERMISSIONS.CREAR_USUARIOS}>
            <Button onClick={() => setIsNewUserModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </ProtectedComponent>
          {/* Modal de Nuevo Usuario */}
          <NewUserModal 
            isOpen={isNewUserModalOpen}
            onClose={() => setIsNewUserModalOpen(false)}
            roles={roles}
           
          />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactiveUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios suspendidos
            </p>
          </CardContent>
        </Card>
      </div>


      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {selectedUsers.length > 0 && (
          <ProtectedComponent permissions={[PERMISSIONS.EDITAR_USUARIOS, PERMISSIONS.ELIMINAR_USUARIOS]}>
            <div className="flex gap-2">
              <ProtectedComponent permissions={PERMISSIONS.EDITAR_USUARIOS}>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
                  <Check className="h-4 w-4 mr-2" />
                  Activar
                </Button>
              </ProtectedComponent>
              <ProtectedComponent permissions={PERMISSIONS.EDITAR_USUARIOS}>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>
                  <X className="h-4 w-4 mr-2" />
                  Desactivar
                </Button>
              </ProtectedComponent>
              <ProtectedComponent permissions={PERMISSIONS.ELIMINAR_USUARIOS}>
                <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </ProtectedComponent>
            </div>
          </ProtectedComponent>
        )}
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Mostrando {stats.filteredCount} de {stats.totalUsers} usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow key={index + 1}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.uid)}
                      onChange={() => toggleUserSelection(user.uid)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {user.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'administrador' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'destructive'}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(user.last_login)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ProtectedComponent permissions={PERMISSIONS.EDITAR_USUARIOS}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            try {
                              const action = user.is_active ? 'deactivate' : 'activate'
                              if (action === 'activate') {
                                await activateUser(user.uid)
                              } else {
                                await deactivateUser(user.uid)
                              }
                            } catch (error) {
                              console.error('Error cambiando estado del usuario:', error)
                            }
                          }}
                        >
                          {user.is_active ? (
                            <>
                              <X className="h-4 w-4 mr-1" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Activar
                            </>
                          )}
                        </Button>
                      </ProtectedComponent>
                      
                      <ProtectedComponent permissions={[PERMISSIONS.EDITAR_USUARIOS, PERMISSIONS.ELIMINAR_USUARIOS]}>
                        <UserActions roles={roles} user={user} onAction={(action) => {
                        
                    
                        }} />
                      </ProtectedComponent>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron usuarios</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay usuarios registrados'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
