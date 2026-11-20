import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Compatibility session route (/api/auth/session)
 * Maps directly to Better Auth getSession API
 */
export async function GET() {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });
    return NextResponse.json(session || null);
  } catch {
    return NextResponse.json(null);
  }
}
