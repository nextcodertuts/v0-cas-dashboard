import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default async function middleware(req: NextRequestWithAuth) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Protect routes based on user role
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  if (pathname.startsWith("/agent")) {
    if (!token || (token.role !== "OFFICE_AGENT" && token.role !== "ADMIN")) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  if (pathname.startsWith("/hospital")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  // API route protection
  if (pathname.startsWith("/api/")) {
    // Allow auth API routes
    if (pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin-only API routes
    if (
      (pathname.startsWith("/api/users") ||
        pathname.startsWith("/api/audit-logs")) &&
      token.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Office agent and admin API routes
    if (
      (pathname.startsWith("/api/households") ||
        pathname.startsWith("/api/members") ||
        pathname.startsWith("/api/plans")) &&
      token.role === "HOSPITAL_USER"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Allow card lookup for all authenticated users
    if (pathname.startsWith("/api/cards/lookup")) {
      return NextResponse.next();
    }

    // Restrict other card operations to office agents and admins
    if (pathname.startsWith("/api/cards") && token.role === "HOSPITAL_USER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/agent/:path*",
    "/hospital/:path*",
    "/api/:path*",
  ],
};
