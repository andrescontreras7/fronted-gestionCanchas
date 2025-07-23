'use client'

import { ModeToggle } from "@/components/mode-toggle"
import { CardLogin, CardRegister } from "@/modules/auth/components"
import { useState } from "react"
import { useAuthForm } from "@/modules/auth/hooks/use-auth-form"

export default function LoginPage() {
  const [showRegister, setShowRegister] = useState(false)
  const { handleLogin, handleRegister, isLoading, error } = useAuthForm()

  const toggleToRegister = () => {
    setShowRegister(true)
  }

  const toggleToLogin = () => {
    setShowRegister(false)
  }

  return (
    <>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      {showRegister ? (
        <CardRegister 
          onToggleLogin={toggleToLogin}
          onRegister={handleRegister}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <CardLogin 
          onToggleRegister={toggleToRegister}
          onLogin={handleLogin}
          isLoading={isLoading}
          error={error}
        />
      )}
    </>
  )
}
