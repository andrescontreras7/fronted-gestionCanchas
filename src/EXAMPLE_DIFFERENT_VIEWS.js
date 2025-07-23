// Ejemplo de cómo usar el MISMO BookingsCard para diferentes vistas

// 1. Página Admin: /admin/bookings/page.jsx
export default function AdminBookingsPage() {
  const { bookings } = useBookings({ scope: 'all' }) // Todas las reservas
  
  return (
    <BookingsCard 
      booking={bookings}
      userRole="administrador"
      currentUserId={currentUser.id}
      showCreateButton={true}
      onEdit={(booking) => router.push(`/admin/bookings/${booking.id}/edit`)}
      onApprove={handleApprove}
      onCancel={handleCancel}
      onDelete={handleDelete}
    />
  )
}

// 2. Página Usuario: /user/bookings/page.jsx  
export default function UserBookingsPage() {
  const { bookings } = useBookings({ scope: 'mine' }) // Solo mis reservas
  
  return (
    <BookingsCard 
      booking={bookings}
      userRole="usuario"
      currentUserId={currentUser.id}
      showCreateButton={true}
      onEdit={(booking) => router.push(`/user/bookings/${booking.id}/edit`)}
      onCancel={handleCancel}
      // Sin onApprove, onDelete (no tiene permisos)
    />
  )
}

// 3. Página Empleado: /employee/bookings/page.jsx
export default function EmployeeBookingsPage() {
  const { bookings } = useBookings({ scope: 'active' }) // Solo reservas activas para check-in
  
  return (
    <BookingsCard 
      booking={bookings}
      userRole="empleado"
      currentUserId={currentUser.id}
      showCreateButton={false}
      onCheckIn={handleCheckIn}
      onCheckOut={handleCheckOut}
      // Sin editar/eliminar
    />
  )
}
