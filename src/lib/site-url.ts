const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteUrl =
  configuredSiteUrl ||
  (process.env.NODE_ENV === "production"
    ? "https://bhumidesignandconstruction.vercel.app"
    : "http://localhost:3000");
