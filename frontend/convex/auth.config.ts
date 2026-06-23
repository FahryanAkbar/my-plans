import { AuthConfig } from "convex/server";

declare const process: { env: Record<string, string | undefined> };

export default {
  providers: [
    {
      // Replace with your Clerk Frontend API URL
      // or with `process.env.CLERK_JWT_ISSUER_DOMAIN`
      // and configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      // domain: 'https://national-swine-87.clerk.accounts.dev',
      // domain: "https://clerk.myplans.my.id",
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "https://national-swine-87.clerk.accounts.dev",
      applicationID: "convex",
    },
  ]
} satisfies AuthConfig;