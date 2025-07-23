'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import SimpleBookingFlow from '@/components/SimpleBookingFlow'

export default function NewBookingPage() {
  const searchParams = useSearchParams()
  const courtId = searchParams.get('court_id')

  if (!courtId) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>No se especifico una cancha para reservar.</p>
      </div>
    )
  }

  return <SimpleBookingFlow courtId={courtId} />
}
