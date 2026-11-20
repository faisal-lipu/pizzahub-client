import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Better Auth API Catch-All Route Handler
 * Serves authentication endpoints (/api/auth/*) in Next.js App Router
 */
export const { GET, POST } = toNextJsHandler(auth);
