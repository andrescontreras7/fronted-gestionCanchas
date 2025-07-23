"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useAuthForm } from "@/modules/auth/hooks/use-auth-form"
import { PermissionsProvider } from "@/hooks/usePermision"
import { ProfileDrawer } from "@/components/ProfileDrawer"
import { storage, setRoleFromCurrentToken } from "@/shared/utils/storage.utils"
import { roleSync } from "@/shared/utils/role-sync"
import { 
  Users, 
  Calendar, 
  MapPin, 
  Settings, 
  BarChart3, 
  Home,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  Award,
  Clock,
  DollarSign,
  FileText,
  Briefcase
} from "lucide-react"
import { ModeToggle } from "../mode-toggle"

const roleNavigation = {
  administrador: {
    badge: { variant: "default", text: "Administrador" },
    color: "border-red-200 bg-red-50",
    mainRoutes: [
      { href: "/admin/dashboard", icon: Home, label: "Dashboard", description: "Panel principal" },
      { href: "/admin/users", icon: Users, label: "Usuarios", description: "Gestión de usuarios" },
      { href: "/admin/courts", icon: MapPin, label: "Canchas", description: "Administrar canchas" },
      { href: "/admin/reservas", icon: Calendar, label: "Reservas", description: "Gestión de reservas" },
      { href: "/admin/bookings", icon: FileText, label: "Historial", description: "Todas las reservas" },
    ],
    quickActions: [
      { href: "/admin/users/new", icon: Users, label: "Nuevo Usuario" },
      { href: "/admin/courts/new", icon: MapPin, label: "Nueva Cancha" },
      { href: "/admin/reservas/today", icon: Calendar, label: "Reservas Hoy" },
      { href: "/admin/reports/today", icon: BarChart3, label: "Reporte Diario" },
    ]
  },


  usuario: {
    badge: { variant: "secondary", text: "Usuario" },
    color: "border-green-200 bg-green-50",
    mainRoutes: [
      { href: "/user/dashboard", icon: Home, label: "Inicio", description: "Panel personal" },
      { href: "/user/bookings", icon: Calendar, label: "Mis Reservas", description: "Historial y próximas" },
      { href: "/user/courts", icon: MapPin, label: "Canchas", description: "Disponibilidad" },
      { href: "/user/profile", icon: User, label: "Mi Perfil", description: "Configuración personal" },
      { href: "/user/payments", icon: DollarSign, label: "Pagos", description: "Historial de pagos" },
    ],
    quickActions: [
      { href: "/user/book", icon: Calendar, label: "Nueva Reserva" },
      { href: "/user/courts/favorites", icon: MapPin, label: "Favoritas" },
      { href: "/user/payments/history", icon: DollarSign, label: "Historial" },
    ]
  }
}

export function DashboardLayout({ children }) {
  const { handleLogout } = useAuthForm()
  const [userRole, setUserRole] = useState(null)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const timer = setTimeout(() => {
      let role = localStorage.getItem('user_role')
      const user = localStorage.getItem('user_data')

      console.log('🔍 Cargando datos del usuario...', role)

      // Auto-fix: Si no hay rol pero hay token, extraerlo del JWT
      if ((!role || role === 'null' || role === 'undefined')) {
        console.log('🔧 Rol no encontrado, intentando extraer del JWT...')
        const extractedRole = setRoleFromCurrentToken()
        if (extractedRole) {
          role = extractedRole
          console.log('✅ Rol extraído del JWT:', role)
        } else {
          console.warn('❌ No se pudo extraer rol del JWT')
        }
      }
      
      const cleanRole = role && role !== 'null' && role !== 'undefined' ? role : null
      setUserRole(cleanRole)
      
      if (user) {
        try {
          setUserData(JSON.parse(user))
        } catch (e) {
          console.error('Error parsing user data:', e)
        }
      }
      
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="animate-pulse bg-gray-200 w-64 h-full"></div>
        <div className="flex-1 flex flex-col">
          <div className="animate-pulse bg-gray-200 h-16 w-full"></div>
          <div className="flex-1 p-6">
            <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!userRole || !roleNavigation[userRole]) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Acceso no autorizado</h2>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder a esta área</p>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const navigation = roleNavigation[userRole]

  return (
    <PermissionsProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
          {/* Header del Sidebar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">CanchasApp</h1>
                  <Badge variant={navigation.badge.variant} className="text-xs">
                    {navigation.badge.text}
                  </Badge>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

       
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navigation.mainRoutes.map((route) => {
                const isActive = pathname === route.href
                const Icon = route.icon
                
                return (
                  <Link key={route.href} href={route.href}>
                    <div className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-400' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}>
                      <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'}`} />
                      {sidebarOpen && (
                        <div className="flex-1">
                          <div>{route.label}</div>
                          {route.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{route.description}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>

         

          {/* Footer del Sidebar */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {sidebarOpen ? (
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setProfileModalOpen(true)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Mi Perfil
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setProfileModalOpen(true)}
                >
                  <User className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="w-full" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Dashboard {navigation.badge.text}
                </h2>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* ModeToggle para tema claro/oscuro */}
                <ModeToggle />
                
                {/* Breadcrumb o información adicional */}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </header>

          {/* Contenido */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Modal de Perfil */}
      <ProfileDrawer
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userRole={userRole}
        userData={userData}
      />
    </PermissionsProvider>
  )
}
