"use client"
import { RoleBasedAside } from '@/components/role-based-aside'
import { RoleBasedNavbar } from '@/components/role-based-navbar'
import { PermissionsProvider } from "@/hooks/usePermision"

export function AppLayout({ children, userRole }) {
  return (
    <PermissionsProvider>
      <div className="flex flex-col h-screen bg-background">
        <RoleBasedNavbar />
        <div className="flex flex-1">
          <RoleBasedAside />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </PermissionsProvider>
  )
}
