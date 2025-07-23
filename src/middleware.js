import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function verifyToken(token) {
  try {
    if (!token) return null;

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key"
    );

    const { payload } = await jwtVerify(token, secret);
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error(" Token inválido:", error.message);

  }
}

function clearInvalidCookies(response) {
  response.cookies.set("auth_token", "", {
    expires: new Date(0),
    path: "/",
  });
  response.cookies.set("user_role", "", {
    expires: new Date(0),
    path: "/",
  });
  response.cookies.set("user_data", "", {
    expires: new Date(0),
    path: "/",
  });
  return response;
}

export async function middleware(request) {
  console.log("🔒 Middleware ejecutándose para:", request.nextUrl.pathname);

  const currentPath = request.nextUrl.pathname;
  const token = request.cookies.get("auth_token")?.value;
  const tokenPayload = await verifyToken(token);

  // Rutas públicas que no necesitan autenticación
  const publicRoutes = ["/", "/login"];
  
  if (publicRoutes.includes(currentPath)) {
    // Si está autenticado y accede a página pública, redirigir según rol
    if (tokenPayload) {
      const userRole = tokenPayload.role || tokenPayload.user_role || "usuario";
      console.log(`🔄 Usuario autenticado (${userRole}) accediendo a página pública, redirigiendo...`);

      switch (userRole) {
        case "administrador":
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        case "usuario":
        default:
          return NextResponse.redirect(new URL("/user/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  // Para rutas protegidas, verificar autenticación
  if (!tokenPayload) {
    console.log("❌ Sin autenticación válida, redirigiendo a login");
    const response = NextResponse.redirect(new URL("/", request.url));
    return clearInvalidCookies(response);
  }

  // Obtener el rol del usuario
  const userRole = tokenPayload.role || tokenPayload.user_role || "usuario";
  console.log(`👤 Usuario autenticado con rol: ${userRole}`);

  // Configurar headers con información del usuario
  const response = NextResponse.next();
  response.headers.set("x-user-id", tokenPayload.sub || tokenPayload.user_id || "");
  response.headers.set("x-user-role", userRole);
  response.headers.set("x-user-name", tokenPayload.username || "");

  // Actualizar cookie de rol si es necesario
  const currentRoleCookie = request.cookies.get("user_role")?.value;
  if (currentRoleCookie !== userRole) {
    response.cookies.set("user_role", userRole, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  const isAdminRoute = currentPath.startsWith("/admin");
  const isUserRoute = currentPath.startsWith("/user");

  if (isAdminRoute) {
    // Solo administradores pueden acceder a rutas /admin/*
    if (userRole !== "administrador") {
      console.log(`🚫 Acceso denegado: usuario con rol "${userRole}" intentó acceder a ruta de admin`);
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
    console.log("✅ Acceso permitido a ruta de administrador");
    return response;
  }

  if (isUserRoute) {

    if (!["usuario", "administrador"].includes(userRole)) {
      console.log(`Acceso denegado: rol "${userRole}" no autorizado para rutas de usuario`);
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/profile/:path*", 
    "/admin/:path*",
    "/user/:path*",
  ],
};