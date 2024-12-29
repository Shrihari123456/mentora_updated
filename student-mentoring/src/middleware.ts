import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/login") {
    const newUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
  if (req.auth && req.nextUrl.pathname === "/login") {
    if (req.auth.user.role === "student") {
      return Response.redirect(new URL("/student", req.nextUrl.origin));
    } else {
      return Response.redirect(new URL("/mentor", req.nextUrl.origin));
    }
  }

  if (req.auth && req.nextUrl.pathname === "/") {
    if (req.auth.user.role === "student") {
      return Response.redirect(new URL("/student", req.nextUrl.origin));
    } else {
      return Response.redirect(new URL("/mentor", req.nextUrl.origin));
    }
  }
  if (req.auth && req.nextUrl.pathname.startsWith("/student")) {
    if (req.auth.user.role === "mentor") {
      return Response.redirect(new URL("/mentor", req.nextUrl.origin));
    } else {
      return;
    }
  }
  if (req.auth && req.nextUrl.pathname.startsWith("/mentor")) {
    if (req.auth.user.role === "student") {
      return Response.redirect(new URL("/student", req.nextUrl.origin));
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
