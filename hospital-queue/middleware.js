import { NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "admin_session";
const DOCTOR_SESSION_COOKIE = "doctor_session";
const PATIENT_SESSION_COOKIE = "patient_session";

const roleConfigs = [
  {
    basePath: "/admin",
    loginPath: "/admin/login",
    defaultPath: "/admin/dashboard",
    cookieName: ADMIN_SESSION_COOKIE,
  },
  {
    basePath: "/doctor",
    loginPath: "/doctor/login",
    defaultPath: "/doctor/dashboard",
    cookieName: DOCTOR_SESSION_COOKIE,
  },
  {
    basePath: "/patient",
    loginPath: "/patient/login",
    defaultPath: "/patient/dashboard",
    cookieName: PATIENT_SESSION_COOKIE,
  },
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const matchedRole = roleConfigs.find((role) =>
    pathname.startsWith(role.basePath)
  );

  if (!matchedRole) {
    return NextResponse.next();
  }

  const session = request.cookies.get(matchedRole.cookieName)?.value;
  const isAuthenticated = session === "authenticated";
  const isLoginPage = pathname === matchedRole.loginPath;

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL(matchedRole.loginPath, request.url));
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL(matchedRole.defaultPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/doctor/:path*", "/patient/:path*"],
};
