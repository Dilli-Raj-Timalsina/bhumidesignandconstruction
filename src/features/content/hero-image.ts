export const defaultHeroImagePath =
  "/images/portfolio/hari-pariyar-side-view.jpg";

const oldSeedHeroPaths = new Set([
  "/images/portfolio/murkuti-crb-shuttering-site.png",
  "portfolio/murkuti-crb-shuttering-site.png",
]);

/** Show the current portfolio photo for sites still using the original seed. */
export function resolveHeroImagePath(path: string | null): string | null {
  return path && oldSeedHeroPaths.has(path) ? defaultHeroImagePath : path;
}
