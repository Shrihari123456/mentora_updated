import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname, origin } = req.nextUrl;

  // Allow all dashboard routes to bypass NextAuth
  if (pathname.startsWith("/student/") || 
      pathname.startsWith("/mentor/") || 
      pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  const isAuth = req.auth;
  const role = isAuth?.user?.role;

  // Only protect login page redirects
  if (isAuth && pathname === "/login") {
    switch (role) {
      case "student":
        return NextResponse.redirect(new URL("/student/dashboard", origin));
      case "mentor":
        return NextResponse.redirect(new URL("/mentor", origin));
      case "admin":
        return NextResponse.redirect(new URL("/admin/dashboard", origin));
      default:
        return NextResponse.next();
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assignmentor123).*)",
  ],
};