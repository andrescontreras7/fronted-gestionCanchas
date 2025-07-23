'use client';

import React from 'react';
import GestionCanchasMejorada from '@/components/admin/GestionCanchasMejorada';
import { ProtectedComponent } from "@/components/ProtectedComponent";
import { PERMISSIONS } from '@/lib/permissions';

export default function CourtsAdminPage() {
  return (
    <ProtectedComponent permissions={PERMISSIONS.VER_CANCHAS}>
      <div className="container mx-auto p-6">
        <GestionCanchasMejorada />
      </div>
    </ProtectedComponent>
  );
}

