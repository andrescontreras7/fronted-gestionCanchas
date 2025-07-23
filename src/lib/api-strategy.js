// ============================================
// 🎯 ESTRATEGIA DE APIs REORGANIZADA
// ============================================

/*
1. 📦 SERVICES (Cliente) - Solo para operaciones del cliente
   - Usan localStorage para tokens
   - Para componentes client-side
   - Manejan estado de UI

2. 🔧 ACTIONS (Servidor) - Solo para operaciones del servidor  
   - Usan cookies para tokens
   - Para componentes server-side
   - Mejor SEO y performance

3. 🎣 HOOKS - Solo para estado y UI
   - No duplican lógica de servicios
   - Se enfocan en estado de UI
   - Reutilizan services o actions según contexto

4. 🛡️ MIDDLEWARE - Para validaciones globales
   - Protección de rutas
   - Verificación de tokens
   - Redirecciones automáticas
*/

// ============================================
// 📋 GUÍA DE CUÁNDO USAR QUÉ
// ============================================

/*
🔸 USA SERVICES (Cliente) cuando:
   ✅ Estás en un componente 'use client'
   ✅ Necesitas interactividad inmediata
   ✅ Manejas estado de formularios
   ✅ Tienes componentes dinámicos

🔸 USA ACTIONS (Servidor) cuando:
   ✅ Estás en un componente servidor
   ✅ Necesitas mejor SEO
   ✅ Los datos no cambian frecuentemente
   ✅ Quieres mejor performance inicial

🔸 USA HOOKS cuando:
   ✅ Necesitas estado compartido
   ✅ Manejas loading/error states
   ✅ Tienes lógica de UI compleja
   ✅ Quieres reutilizar estado
*/

export const API_STRATEGY = {
  CLIENT_SERVICES: "Para componentes client-side con interactividad",
  SERVER_ACTIONS: "Para componentes server-side con mejor performance", 
  HOOKS: "Para estado de UI y lógica reutilizable",
  MIDDLEWARE: "Para protección global de rutas"
}
