'use client'

import { getCourts } from '@/lib/server-actions'
import UserCourtsComponents from '@/modules/courts/components/UserCourtsComponents'
import { useEffect, useState } from 'react'

export default function NewBookingPage() {
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourts = async () => {
      try {
        const data = await getCourts()
        setCourts(data)
      } catch (error) {
        console.error('Error cargando canchas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCourts()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Cargando Canchas</h1>
        <p>Obteniendo canchas disponibles...</p>
      </div>
    )
  }

  return <UserCourtsComponents courts={courts} />
}

