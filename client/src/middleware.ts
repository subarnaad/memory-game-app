import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const access = req.cookies.get("access_token")?.value;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/home") || pathname.startsWith("/game")) {
    if (!access) {
      const loginUrl = new URL("/", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === "/") {
    if (access) {
      const homeUrl = new URL("/home", req.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/", "/game/:path*"],
};
