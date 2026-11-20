import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

/**
 * Better Auth Server Configuration
 * Configures authentication server with JWT plugin for interoperability with Express backend
 */
export const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET ||
    process.env.JWT_SECRET ||
    "pizzahub_default_jwt_secret_key_change_in_production_32chars",
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",
  plugins: [
    jwt({
      jwt: {
        expirationTime: "7d",
      },
    }),
  ],
});
