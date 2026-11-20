import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

/**
 * Better Auth Server Configuration
 * Configures authentication server with Google OAuth and JWT plugin
 */
const getBaseUrl = () => {
  if (process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes("localhost")) {
    return process.env.BETTER_AUTH_URL;
  }
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "production") {
    return "https://pizzahub-client-beta.vercel.app";
  }
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
};

export const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET ||
    process.env.JWT_SECRET ||
    "pizzahub_default_jwt_secret_key_change_in_production_32chars",
  baseURL: getBaseUrl(),
  trustedOrigins: [
    "https://pizzahub-client-beta.vercel.app",
    "http://localhost:3000",
  ],
  socialProviders: {
    google: {
      clientId:
        process.env.GOOGLE_CLIENT_ID ||
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        process.env.BETTER_AUTH_GOOGLE_CLIENT_ID ||
        "",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ||
        process.env.BETTER_AUTH_GOOGLE_SECRET ||
        "",
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
