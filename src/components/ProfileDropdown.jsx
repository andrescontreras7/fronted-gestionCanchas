"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  User, 
  Settings, 
  LogOut, 
  Edit,
  Save,
  X,
  Calendar,
  DollarSign,
  Shield
} from "lucide-react"

export function ProfileDropdown({ 
  isOpen, 
  onClose, 
  userRole, 
  userData, 
  onLogout,
  triggerRef 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(userData || {})
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (userData) {
      setFormData(userData)
    }
  }, [userData])

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    // Aquí harías la llamada a la API para actualizar
    localStorage.setItem('user_data', JSON.stringify(formData))
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

  if (!isOpen) return null

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
    >
      {/* Header del Dropdown */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{formData.username || 'Usuario'}</h3>
              <p className="text-sm text-gray-600">{formData.email}</p>
              <Badge variant={getRoleBadgeVariant(userRole)} className="text-xs mt-1">
                {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contenido del Dropdown */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Información Personal */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Información Personal</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label htmlFor="username" className="text-xs">Nombre de usuario</Label>
              <Input
                id="username"
                value={formData.username || ''}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={!isEditing}
                className="h-8 text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                className="h-8 text-sm"
              />
            </div>

            {isEditing && (
              <Button onClick={handleSave} size="sm" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            )}
          </div>
        </div>

        {/* Estadísticas Rápidas según el Rol */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Mi Actividad</h4>
          <div className="grid grid-cols-2 gap-3">
            {userRole === 'usuario' && (
              <>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <Calendar className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                  <div className="text-lg font-bold text-blue-700">5</div>
                  <div className="text-xs text-blue-600">Reservas</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <DollarSign className="h-4 w-4 mx-auto mb-1 text-green-600" />
                  <div className="text-lg font-bold text-green-700">$1,250</div>
                  <div className="text-xs text-green-600">Este mes</div>
                </div>
              </>
            )}
            
            {userRole === 'administrador' && (
              <>
                <div className="text-center p-2 bg-red-50 rounded">
                  <Shield className="h-4 w-4 mx-auto mb-1 text-red-600" />
                  <div className="text-lg font-bold text-red-700">150</div>
                  <div className="text-xs text-red-600">Usuarios</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <Calendar className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                  <div className="text-lg font-bold text-blue-700">45</div>
                  <div className="text-xs text-blue-600">Hoy</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

  
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
