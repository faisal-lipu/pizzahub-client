import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

/**
 * Better Auth Server Configuration
 * Configures authentication server with Google OAuth and JWT plugin
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
  socialProviders: {
    google: {
      clientId:
        process.env.GOOGLE_CLIENT_ID ||
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        "103456789012-samplegoogleclientid.apps.googleusercontent.com",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ||
        "GOCSPX-samplegoogleclientsecretkey",
    },
  },
  plugins: [
    jwt({
      jwt: {
        expirationTime: "7d",
      },
    }),
  ],
});
