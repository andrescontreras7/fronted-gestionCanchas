"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthForm } from "@/modules/auth/hooks/use-auth-form"
import { 
  Users, 
  Calendar, 
  MapPin, 
  Settings, 
  BarChart3, 
  Home,
  User,
  LogOut
} from "lucide-react"

export function RoleBasedNavbar() {
  const { handleLogout } = useAuthForm()
  const [userRole, setUserRole] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Obtener rol del localStorage
    const timer = setTimeout(() => {
      const role = localStorage.getItem('user_role')
      console.log('🔍 Navbar - Role from localStorage:', role)
      
      // Limpiar el rol si es un string vacío o null
      const cleanRole = role && role !== 'null' && role !== 'undefined' ? role : null
      setUserRole(cleanRole)
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])



  if (isLoading) {
    return (
      <nav className="bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="animate-pulse h-6 bg-gray-200 rounded w-32"></div>
          <div className="animate-pulse h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </nav>
    )
  }

  // Navegación para Administrador
  if (userRole === 'administrador') {
    return (
      <nav className="bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold">CanchasApp</h1>
              <Badge variant="default" className="text-xs">Administrador</Badge>
            </div>
            
            <div className="flex  space-x-4">
            
             
              
            
              
              <Link href="/admin/settings">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <Settings className="h-4 w-4" />
                  <span>Configuración</span>
                </Button>
              </Link>
            </div>
          </div>
          
       <div className="flex items-center space-x-2">
           <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" />
            Salir
          </Button>
            <Link href="/profile">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>profile</span>
                </Button>
              </Link>
       </div>
        </div>
      </nav>
    )
  }

  // Navegación para Usuario
  if (userRole === 'usuario') {
    return (
      <nav className="bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold">CanchasApp</h1>
              <Badge variant="secondary" className="text-xs">Usuario</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/user/home">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <Home className="h-4 w-4" />
                  <span>Inicio</span>
                </Button>
              </Link>
              
              <Link href="/user/reservas">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Mis Reservas</span>
                </Button>
              </Link>
              
              <Link href="/user/courts">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>Canchas</span>
                </Button>
              </Link>
              
              <Link href="/user/perfil">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Mi Perfil</span>
                </Button>
              </Link>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" />
            Salir
          </Button>
        </div>
      </nav>
    )
  }

  // Navegación para Gerente
  if (userRole === 'gerente') {
    return (
      <nav className="bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold">CanchasApp</h1>
              <Badge variant="outline" className="text-xs">Gerente</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/gerente">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              
              <Link href="/gerente/bookings">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Reservas</span>
                </Button>
              </Link>
              
              <Link href="/gerente/courts">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>Canchas</span>
                </Button>
              </Link>
              
              <Link href="/gerente/reports">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>Reportes</span>
                </Button>
              </Link>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" />
            Salir
          </Button>
        </div>
      </nav>
    )
  }

  // Sin rol o sin login
  return (
    <nav className="bg-background border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">CanchasApp</h1>
        <Link href="/">
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-1" />
            Iniciar Sesión
          </Button>
        </Link>
      </div>
    </nav>
  )
}
