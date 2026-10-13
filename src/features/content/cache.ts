export const publicContentTags = {
  site: "public:site",
  projects: "public:projects",
  services: "public:services",
  gallery: "public:gallery",
  posts: "public:posts",
} as const;

// Admin saves expire these tags immediately. The TTL also covers changes made
// outside this application's admin actions.
export const publicContentRevalidateSeconds = 60;

export const contentUpdateChannel = "bhumi-cms-updates";
