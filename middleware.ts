import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isMaintenanceMode =
    process.env.MAINTENANCE_MODE === "true";

  const isAdminPage =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  const isAdminApi =
    pathname.startsWith("/api/admin/");

  const isMaintenancePage =
    pathname.startsWith("/maintenance");

  // 管理画面と管理APIをBasic認証で保護
  if (isAdminPage || isAdminApi) {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
      return new NextResponse(
        "Admin authentication is not configured",
        { status: 503 }
      );
    }

    const authorization =
      request.headers.get("authorization");

    if (authorization?.startsWith("Basic ")) {
      try {
        const encoded = authorization.slice(6);
        const decoded = atob(encoded);
        const separator = decoded.indexOf(":");

        if (separator !== -1) {
          const user = decoded.slice(0, separator);
          const pass = decoded.slice(separator + 1);

          if (user === username && pass === password) {
            return NextResponse.next();
          }
        }
      } catch {
        // 不正な認証ヘッダー
      }
    }

    return new NextResponse(
      "Authentication required",
      {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Area"',
        },
      }
    );
  }

  // メンテナンスモード
  if (isMaintenanceMode && !isMaintenancePage) {
    return NextResponse.redirect(
      new URL("/maintenance", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};