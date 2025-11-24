import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname, origin } = req.nextUrl;

  const isAuth = req.auth;
  const role = isAuth?.user?.role;

  // Unauthenticated and trying to access anything except login → redirect to login
  if (!isAuth && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", origin));
  }

  // Authenticated and trying to access login → redirect to respective dashboard
  if (isAuth && pathname === "/login") {
    switch (role) {
      case "student":
        return NextResponse.redirect(new URL("/student/dashboard", origin));
      case "mentor":
        return NextResponse.redirect(new URL("/mentor", origin));
      case "admin":
        return NextResponse.redirect(new URL("/admin/dashboard", origin));
      default:
        return;
    }
  }

  // Authenticated and visiting root → redirect to respective dashboard
  if (isAuth && pathname === "/") {
    switch (role) {
      case "student":
        return NextResponse.redirect(new URL("/student/dashboard", origin));
      case "mentor":
        return NextResponse.redirect(new URL("/mentor", origin));
      case "admin":
        return NextResponse.redirect(new URL("/admin/dashboard", origin));
      default:
        return;
    }
  }

  // Role-based access control
  if (isAuth) {
    if (pathname.startsWith("/student") && role !== "student") {
      return NextResponse.redirect(new URL("/login", origin));
    }

    if (pathname.startsWith("/mentor") && role !== "mentor") {
      return NextResponse.redirect(new URL("/login", origin));
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/login", origin));
    }
  }

  // Default allow
  return;
});

// ✅ Required for middleware in App Router (no change here)
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assignmentor123).*)",
  ],
};
