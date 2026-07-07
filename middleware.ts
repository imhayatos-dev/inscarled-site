import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";

  const isAdminPage = pathname.startsWith("/admin");
  const isMaintenancePage = pathname.startsWith("/maintenance");

  if (isMaintenanceMode && !isMaintenancePage && !isAdminPage) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  if (isAdminPage) {
    const basicAuth = request.headers.get("authorization");

    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const [user, pass] = atob(authValue).split(":");

      if (user === username && pass === password) {
        return NextResponse.next();
      }
    }

    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};