import { NextResponse, type NextRequest } from "next/server";
import { isAuthorized } from "@/lib/access";

/**
 * Demo gate: when DEMO_PASSWORD is set, every page and API route requires it
 * (HTTP Basic, any username). Pages are always marked noindex.
 */
export function proxy(request: NextRequest) {
  const password = process.env.DEMO_PASSWORD;
  if (password && !isAuthorized(request.headers.get("authorization"), password)) {
    return new NextResponse("需要访问密码 / Password required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Printlens demo", charset="UTF-8"',
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
