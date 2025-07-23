export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-red-600 mb-4">🚫 Acceso Denegado</h1>
        <p className="text-lg text-gray-600 mb-6">
          No tienes permisos suficientes para acceder a esta página.
        </p>
        <div className="space-x-4">
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Volver
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
