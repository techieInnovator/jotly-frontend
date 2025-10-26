import { NextResponse } from "next/server";

export default function middleware(req) {
  // For now, allow all routes
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|.*\\..*).*)"], // optional
};
