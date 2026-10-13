import type { Metadata } from "next";

import type { PageIntroKey } from "./page-intros";
import { pageIntroDefaults } from "./page-intros";
import { getSiteContent } from "./queries";

/** Keep search snippets in step with the editable page introduction. */
export async function getPageIntroMetadata(
  page: PageIntroKey,
  canonical: string,
): Promise<Metadata> {
  const site = await getSiteContent();
  const intro = site.pageIntros[page];
  return {
    title: intro.title || pageIntroDefaults[page].label,
    description:
      intro.subtitle ||
      site.defaultSeoDescription ||
      site.description ||
      undefined,
    alternates: { canonical },
  };
}
