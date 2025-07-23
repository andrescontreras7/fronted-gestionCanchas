"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ProtectedComponent } from "@/components/ProtectedComponent"
import { PERMISSIONS } from "@/lib/permissions"
import { useUserPermissions } from "@/hooks/usePermision"
import { storage } from "@/shared/utils/storage.utils"
import { 
  User, 
  Settings, 
  Shield, 
  Calendar, 
  BarChart3, 
  Users,
  MapPin,
  Award,
  Clock,
  DollarSign,
  FileText,
  ChevronRight
} from "lucide-react"


function AdminProfileContent({ userData }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Panel de Administrador
          </CardTitle>
          <CardDescription>
            Acceso completo al sistema - Control total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group cursor-pointer transition-all hover:shadow-md p-4 border rounded-lg hover:border-blue-300">
              <Users className="h-8 w-8 mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Gestión de Usuarios</h3>
              <p className="text-sm text-gray-600">Control total de usuarios</p>
              <ChevronRight className="h-4 w-4 mt-2 text-gray-400" />
            </div>
            <div className="group cursor-pointer transition-all hover:shadow-md p-4 border rounded-lg hover:border-green-300">
              <BarChart3 className="h-8 w-8 mb-2 text-green-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Reportes Avanzados</h3>
              <p className="text-sm text-gray-600">Analytics completo</p>
              <ChevronRight className="h-4 w-4 mt-2 text-gray-400" />
            </div>
            <div className="group cursor-pointer transition-all hover:shadow-md p-4 border rounded-lg hover:border-purple-300">
              <Settings className="h-8 w-8 mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Configuración Global</h3>
              <p className="text-sm text-gray-600">Sistema completo</p>
              <ChevronRight className="h-4 w-4 mt-2 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">150</div>
              <div className="text-sm text-gray-600">Usuarios Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">45</div>
              <div className="text-sm text-gray-600">Reservas Hoy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-gray-600">Canchas Activas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">98%</div>
              <div className="text-sm text-gray-600">Ocupación</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para perfil de Gerente
function GerenteProfileContent({ userData }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Panel de Gerente
          </CardTitle>
          <CardDescription>
            Gestión operativa y reportes de área
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group cursor-pointer transition-all hover:shadow-md p-4 border rounded-lg hover:border-blue-300">
              <Calendar className="h-8 w-8 mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Gestión de Reservas</h3>
              <p className="text-sm text-gray-600">Control operativo diario</p>
            </div>
            <div className="group cursor-pointer transition-all hover:shadow-md p-4 border rounded-lg hover:border-green-300">
              <BarChart3 className="h-8 w-8 mb-2 text-green-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Reportes de Área</h3>
              <p className="text-sm text-gray-600">Analytics operativo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para perfil de Empleado
function EmpleadoProfileContent({ userData }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Panel de Empleado
          </CardTitle>
          <CardDescription>
            Operaciones diarias y mantenimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group cursor-pointer transition-all hover:shadow-md p-4 border rounded-lg hover:border-blue-300">
              <Calendar className="h-8 w-8 mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Reservas del Día</h3>
              <p className="text-sm text-gray-600">Gestión diaria</p>
            </div>
            <div className="group cursor-pointer transition-all hover:shadow-md p-4 border rounded-lg hover:border-orange-300">
              <MapPin className="h-8 w-8 mb-2 text-orange-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Estado de Canchas</h3>
              <p className="text-sm text-gray-600">Mantenimiento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


function UsuarioProfileContent({ userData }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            Mi Actividad
          </CardTitle>
          <CardDescription>
            Resumen de tus reservas y actividad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group cursor-pointer transition-all hover:shadow-md p-4 border rounded-lg hover:border-blue-300">
              <Calendar className="h-8 w-8 mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Mis Reservas</h3>
              <p className="text-sm text-gray-600">Próximas y pasadas</p>
              <div className="mt-2 text-sm font-medium text-blue-600">5 activas</div>
            </div>
            <div className="group cursor-pointer transition-all hover:shadow-md p-4 border rounded-lg hover:border-green-300">
              <DollarSign className="h-8 w-8 mb-2 text-green-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Historial de Pagos</h3>
              <p className="text-sm text-gray-600">Facturas y recibos</p>
              <div className="mt-2 text-sm font-medium text-green-600">$1,250 este mes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DynamicUserProfile() {
  const [userData, setUserData] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [activeTab, setActiveTab] = useState('info')
  const userPermissions = useUserPermissions()

  useEffect(() => {
    // Obtener datos del usuario
    const data = storage.getUserData()
    const role = localStorage.getItem('user_role')
    
    if (data) {
      setUserData(data)
      setFormData(data)
    }
    
    if (role) {
      setUserRole(role)
    }
    
    setIsLoading(false)
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    // Aquí harías la llamada a la API para actualizar
    setUserData(formData)
    storage.setUserData(formData)
    setIsEditing(false)
  }

  // Función para obtener el color del badge según el rol
  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'administrador': return 'default'
      case 'gerente': return 'secondary'
      case 'empleado': return 'outline'
      case 'usuario': return 'secondary'
      default: return 'secondary'
    }
  }

  // Función para renderizar contenido específico por rol
  const renderRoleSpecificContent = () => {
    switch (userRole) {
      case 'administrador':
        return <AdminProfileContent userData={userData} />
      case 'gerente':
        return <GerenteProfileContent userData={userData} />
      case 'empleado':
        return <EmpleadoProfileContent userData={userData} />
      case 'usuario':
      default:
        return <UsuarioProfileContent userData={userData} />
    }
  }

  // Función para las tabs (sin dependencias externas)
  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header del Perfil */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{userData?.username || 'Usuario'}</h1>
                <p className="text-gray-600">{userData?.email}</p>
                <Badge variant={getRoleBadgeVariant(userRole)} className="mt-1">
                  {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
                </Badge>
              </div>
            </div>
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancelar" : "Editar Perfil"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Navegación de Tabs */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        <TabButton 
          id="info" 
          label="Información" 
          isActive={activeTab === 'info'} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="activity" 
          label="Actividad" 
          isActive={activeTab === 'activity'} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="permissions" 
          label="Permisos" 
          isActive={activeTab === 'permissions'} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="settings" 
          label="Configuración" 
          isActive={activeTab === 'settings'} 
          onClick={setActiveTab} 
        />
      </div>

      {/* Contenido de las Tabs */}
      {activeTab === 'info' && (
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Gestiona tu información personal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  value={formData.username || ''}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="first_name">Nombre</Label>
                <Input
                  id="first_name"
                  value={formData.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Apellido</Label>
                <Input
                  id="last_name"
                  value={formData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            {isEditing && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  Guardar Cambios
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'activity' && renderRoleSpecificContent()}

      {activeTab === 'permissions' && (
        <Card>
          <CardHeader>
            <CardTitle>Mis Permisos</CardTitle>
            <CardDescription>
              Permisos disponibles para tu rol actual ({userPermissions?.length || 0} activos)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.values(PERMISSIONS).map(permission => {
                const hasPermission = userPermissions?.includes(permission)
                return (
                  <Badge 
                    key={permission} 
                    variant={hasPermission ? "default" : "secondary"}
                    className={hasPermission ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}
                  >
                    {hasPermission ? "✓" : "✗"} {permission}
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>
              Preferencias de la cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ProtectedComponent permissions={PERMISSIONS.GESTIONAR_PERMISOS}>
                <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                  <h3 className="font-semibold mb-2 text-red-800">⚙️ Configuración Avanzada</h3>
                  <p className="text-sm text-red-600">Panel de administración del sistema</p>
                </div>
              </ProtectedComponent>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">🔔 Notificaciones</h3>
                <p className="text-sm text-gray-600">Configurar notificaciones por email</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">🔒 Privacidad</h3>
                <p className="text-sm text-gray-600">Gestionar configuración de privacidad</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">🌙 Tema</h3>
                <p className="text-sm text-gray-600">Cambiar entre modo claro y oscuro</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
