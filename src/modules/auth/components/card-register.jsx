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
import { registerSchema } from "../schemas/auth.schemas"

export function CardRegister({ onToggleLogin, onRegister, isLoading, error }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
    watch
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      clearErrors()
      await onRegister(data)
    } catch (err) {

      console.error('Error en registro:', err)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Crea tu cuenta</CardTitle>
        <CardDescription>
          Completa los datos para crear tu cuenta nueva
        </CardDescription>
       
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre </Label>
              <Input
                id="last_name"
                type="text"
                placeholder="Juan Pérez"
                {...register('last_name')}
                className={errors.last_name ? 'border-destructive' : ''}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>

             <div className="grid gap-2">
              <Label htmlFor="lastname">Apellido</Label>
              <Input
                id="last_name"
                type="text"
                placeholder="Juan Pérez"
                {...register('lastname')}
                className={errors.lastname ? 'border-destructive' : ''}
              />
              {errors.lastname && (
                <p className="text-sm text-destructive">{errors.lastname.message}</p>
              )}
            </div>
            
            
            <div className="grid gap-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
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
              <Label htmlFor="register-password">Contraseña</Label>
              <Input
                id="register-password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                {...register('password')}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              {password && password.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : 'text-destructive'}`}>
                    <span>{password.length >= 8 ? '✓' : '✗'}</span>
                    Al menos 8 caracteres
                  </div>
                  <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-destructive'}`}>
                    <span>{/[A-Z]/.test(password) ? '✓' : '✗'}</span>
                    Una mayúscula
                  </div>
                  <div className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-destructive'}`}>
                    <span>{/[a-z]/.test(password) ? '✓' : '✗'}</span>
                    Una minúscula
                  </div>
                  <div className={`flex items-center gap-1 ${/\d/.test(password) ? 'text-green-600' : 'text-destructive'}`}>
                    <span>{/\d/.test(password) ? '✓' : '✗'}</span>
                    Un número
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirmar contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirma tu contraseña"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            
        
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex-col gap-2">
        <div className="text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <button 
            onClick={onToggleLogin}
            className="underline underline-offset-4 hover:text-foreground cursor-pointer"
          >
            Inicia sesión
          </button>
        </div>
       
      </CardFooter>
    </Card>
  )
}
