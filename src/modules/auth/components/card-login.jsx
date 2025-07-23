import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema } from "../schemas/auth.schemas"

export function CardLogin({ onToggleRegister, onLogin, isLoading, error }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm({
    resolver: zodResolver(loginSchema),
    
  })

  const onSubmit = async (data) => {
    try {
      clearErrors()
      await onLogin(data)
    } catch (err) {
      
      console.error('Error en login:', err)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Inicia sesión en tu cuenta</CardTitle>
        <CardDescription>
          Ingresa tu email para iniciar sesión en tu cuenta
        </CardDescription>
        
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
  
          

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Contraseña</Label>
                <button
                  type="button"
                  onClick={() => {/* TODO: Implementar forgot password */}}
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-muted-foreground hover:text-foreground"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <Input 
                id="password" 
                type="password"
                {...register('password')}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex-col gap-2">
        <div className="text-center text-sm text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <button 
            onClick={onToggleRegister}
            className="underline underline-offset-4 hover:text-foreground cursor-pointer"
          >
            Regístrate
          </button>
        </div>
        <Button variant="outline" className="w-full" disabled={isLoading}>
          Iniciar sesión con Google
        </Button>

        
      </CardFooter>
      {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 m-auto border border-destructive/20 rounded-md">
              {error}
            </div>
          )}
    </Card>
  )
}
