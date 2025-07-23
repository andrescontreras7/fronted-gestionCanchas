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
  const currentPath = request.nextUrl.pathname;
  const token = request.cookies.get("auth_token")?.value;
  const tokenPayload = await verifyToken(token);

  const publicRoutes = ["/", "/login"];

  if (publicRoutes.includes(currentPath)) {
    if (tokenPayload) {
      const userRole = tokenPayload.role || tokenPayload.user_role || "usuario";

      switch (userRole) {
        case "administrador":
          return NextResponse.redirect(
            new URL("/admin/dashboard", request.url)
          );
        case "usuario":
        default:
          return NextResponse.redirect(new URL("/user/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  if (!tokenPayload) {
    const response = NextResponse.redirect(new URL("/", request.url));
    return clearInvalidCookies(response);
  }
  const userRole = tokenPayload.role || tokenPayload.user_role || "usuario";

  const response = NextResponse.next();
  response.headers.set(
    "x-user-id",
    tokenPayload.sub || tokenPayload.user_id || ""
  );
  response.headers.set("x-user-role", userRole);
  response.headers.set("x-user-name", tokenPayload.username || "");
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
    if (userRole !== "administrador") {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }

    return response;
  }

  if (isUserRoute) {
    if (!["usuario", "administrador"].includes(userRole)) {
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
