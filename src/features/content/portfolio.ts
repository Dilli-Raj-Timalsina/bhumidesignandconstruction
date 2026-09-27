import type {
  PublicAlbumImage,
  PublicGalleryAlbum,
  PublicPost,
  PublicProject,
  PublicProjectImage,
  PublicService,
  SiteContent,
} from "./types";

/**
 * Portfolio-backed content used when the CMS has not been configured or has no
 * published records yet. Every detail below comes from the supplied Bhumi
 * portfolio; it intentionally does not invent articles, testimonials, awards,
 * dates, or contact information.
 */

const projectImage = (
  id: string,
  image: string,
  altText: string,
  caption: string,
  sortOrder: number,
): PublicProjectImage => ({ id, image, altText, caption, sortOrder });

const murkutiImages = [
  projectImage(
    "fallback-murkuti-crb-shuttering-site",
    "/images/portfolio/murkuti-crb-shuttering-site.png",
    "Control Room Building shuttering works at Murkuti Substation",
    "Shuttering works of the Control Room Building.",
    0,
  ),
  projectImage(
    "fallback-murkuti-crb-shuttering",
    "/images/portfolio/murkuti-crb-shuttering.png",
    "Control Room Building shuttering at Murkuti Substation",
    "Control Room Building shuttering works.",
    1,
  ),
  projectImage(
    "fallback-murkuti-crb-slab-casting-site",
    "/images/portfolio/murkuti-crb-slab-casting-site.png",
    "Control Room Building slab casting at Murkuti Substation",
    "At the Control Room Building slab-casting date.",
    2,
  ),
  projectImage(
    "fallback-murkuti-crb-slab-casting",
    "/images/portfolio/murkuti-crb-slab-casting.png",
    "Control Room Building slab casting in progress at Murkuti Substation",
    "Control Room Building slab casting.",
    3,
  ),
  projectImage(
    "fallback-murkuti-crb-formwork-removed",
    "/images/portfolio/murkuti-crb-formwork-removed.png",
    "Control Room Building after formwork removal at Murkuti Substation",
    "Control Room Building after removal of formworks.",
    4,
  ),
  projectImage(
    "fallback-murkuti-staff-quarter-shuttering",
    "/images/portfolio/murkuti-staff-quarter-shuttering.png",
    "Staff Quarter shuttering at Murkuti Substation",
    "Staff Quarter shuttering.",
    5,
  ),
  projectImage(
    "fallback-murkuti-staff-quarter-slab-casting",
    "/images/portfolio/murkuti-staff-quarter-slab-casting.png",
    "Staff Quarter after slab casting at Murkuti Substation",
    "Staff Quarter after slab casting.",
    6,
  ),
];

const gehendraOliImages = [
  projectImage(
    "fallback-gehendra-oli-proposed-design",
    "/images/portfolio/gehendra-oli-proposed-design.jpg",
    "Proposed four-storey residential building design for Gehendra Oli",
    "3D architectural visualization — proposed four-storey residential building.",
    0,
  ),
  projectImage(
    "fallback-gehendra-oli-foundation-progress",
    "/images/portfolio/gehendra-oli-foundation-progress.jpg",
    "Foundation-stage construction progress at the Gehendra Oli residence",
    "Foundation-stage site progress.",
    1,
  ),
  projectImage(
    "fallback-gehendra-oli-foundation-progress-2",
    "/images/portfolio/gehendra-oli-foundation-progress-2.jpg",
    "RCC column and toe-wall construction at the Gehendra Oli residence",
    "RCC column and toe-wall works in progress at the foundation stage.",
    2,
  ),
  projectImage(
    "fallback-gehendra-oli-toe-wall-reinforcement",
    "/images/portfolio/gehendra-oli-toe-wall-reinforcement.jpg",
    "Toe wall and column reinforcement layout at the Gehendra Oli residence",
    "Completed toe wall and column reinforcement layout.",
    3,
  ),
  projectImage(
    "fallback-gehendra-oli-rcc-columns",
    "/images/portfolio/gehendra-oli-rcc-columns.jpg",
    "RCC columns above the plinth-level toe wall at the Gehendra Oli residence",
    "RCC columns cast above the plinth-level toe wall, ready for further construction.",
    4,
  ),
  projectImage(
    "fallback-gehendra-oli-contract-signing",
    "/images/portfolio/gehendra-oli-contract-signing.jpg",
    "Contract signing for the Gehendra Oli turnkey residential project",
    "Contract signing.",
    5,
  ),
  projectImage(
    "fallback-gehendra-oli-contract-signing-2",
    "/images/portfolio/gehendra-oli-contract-signing-2.jpg",
    "Contract-signing record for the Gehendra Oli turnkey residential project",
    "Contract signing.",
    6,
  ),
];

const krishnaOliImages = [
  projectImage(
    "fallback-krishna-oli-proposed-design",
    "/images/portfolio/krishna-oli-proposed-design.jpg",
    "Proposed design for Krishna Oli's 1.5-storey floor addition",
    "Proposed building design.",
    0,
  ),
  projectImage(
    "fallback-krishna-oli-contract-signing",
    "/images/portfolio/krishna-oli-contract-signing.jpg",
    "Contract signing for Krishna Oli's floor-addition project",
    "Contract signing.",
    1,
  ),
  projectImage(
    "fallback-krishna-oli-roof-slab-shuttering",
    "/images/portfolio/krishna-oli-roof-slab-shuttering.jpg",
    "Roof slab shuttering at Krishna Oli's floor-addition project",
    "Superstructure works — brickwork complete with roof slab shuttering in progress.",
    2,
  ),
];

const sherKhadkaImages = [
  projectImage(
    "fallback-sher-khadka-proposed-design",
    "/images/portfolio/sher-khadka-proposed-design.jpg",
    "Proposed residential building design for Sher Bahadur Khadka",
    "Proposed building design.",
    0,
  ),
  projectImage(
    "fallback-sher-khadka-contract-signing",
    "/images/portfolio/sher-khadka-contract-signing.jpg",
    "Contract signing for the Sher Bahadur Khadka residential project",
    "Contract signing.",
    1,
  ),
  projectImage(
    "fallback-sher-khadka-foundation-footings",
    "/images/portfolio/sher-khadka-foundation-footings.jpg",
    "Isolated column footings at the Sher Bahadur Khadka residence",
    "Foundation stage — isolated column footings cast.",
    2,
  ),
  projectImage(
    "fallback-sher-khadka-foundation-toe-wall",
    "/images/portfolio/sher-khadka-foundation-toe-wall.jpg",
    "Foundation toe wall and column base at the Sher Bahadur Khadka residence",
    "Foundation toe wall and column base under construction.",
    3,
  ),
  projectImage(
    "fallback-sher-khadka-toe-wall-reinforcement",
    "/images/portfolio/sher-khadka-toe-wall-reinforcement.jpg",
    "Foundation toe wall with column reinforcement at the Sher Bahadur Khadka residence",
    "Foundation toe wall completed with column reinforcement — wider site view.",
    4,
  ),
  projectImage(
    "fallback-sher-khadka-slab-reinforcement",
    "/images/portfolio/sher-khadka-slab-reinforcement.jpg",
    "Roof slab reinforcement at the Sher Bahadur Khadka residence",
    "Roof slab reinforcement work in progress.",
    5,
  ),
  projectImage(
    "fallback-sher-khadka-superstructure-shuttering",
    "/images/portfolio/sher-khadka-superstructure-shuttering.jpg",
    "Brickwork and top-floor roof shuttering at the Sher Bahadur Khadka residence",
    "Superstructure rising — brickwork complete with roof shuttering at top floor.",
    6,
  ),
  projectImage(
    "fallback-sher-khadka-brickwork",
    "/images/portfolio/sher-khadka-brickwork.jpg",
    "Completed brickwork at the Sher Bahadur Khadka residence",
    "Brickwork complete to top floor, structure ready for plastering.",
    7,
  ),
  projectImage(
    "fallback-sher-khadka-finishing",
    "/images/portfolio/sher-khadka-finishing.jpg",
    "Plastering and finishing works at the Sher Bahadur Khadka residence",
    "Current status — plastering and finishing works in progress, near completion.",
    8,
  ),
];

const hariPariyarImages = [
  projectImage(
    "fallback-hari-pariyar-roof-shuttering",
    "/images/portfolio/hari-pariyar-roof-shuttering.jpg",
    "Bamboo formwork for roof slab shuttering at the Hari Bahadur Pariyar project",
    "Roof slab shuttering with bamboo formwork at top floor prior to casting.",
    0,
  ),
  projectImage(
    "fallback-hari-pariyar-roof-complete",
    "/images/portfolio/hari-pariyar-roof-complete.jpg",
    "Structure work completed to roof level at the Hari Bahadur Pariyar project",
    "Structure work completed to roof level — brickwork and parapet complete.",
    1,
  ),
  projectImage(
    "fallback-hari-pariyar-brick-facade",
    "/images/portfolio/hari-pariyar-brick-facade.jpg",
    "Completed brick facade before plastering at the Hari Bahadur Pariyar project",
    "Completed structure — brick facade prior to plastering, evening view.",
    2,
  ),
  projectImage(
    "fallback-hari-pariyar-plastering",
    "/images/portfolio/hari-pariyar-plastering.jpg",
    "Plastering works at the Hari Bahadur Pariyar project",
    "Plastering works completed, scaffolding still in place.",
    3,
  ),
  projectImage(
    "fallback-hari-pariyar-side-view",
    "/images/portfolio/hari-pariyar-side-view.jpg",
    "Side view of the completed Hari Bahadur Pariyar building",
    "Completed building — side view with scaffolding partially removed.",
    4,
  ),
  projectImage(
    "fallback-hari-pariyar-complete",
    "/images/portfolio/hari-pariyar-complete.jpg",
    "Completed Hari Bahadur Pariyar building in Jamani, Dang",
    "Final completed structure — plastering finished, water tank installed and scaffolding removed.",
    5,
  ),
];

export const portfolioFallbackSite: SiteContent = {
  companyName: "BHUMI DESIGN AND CONSTRUCTION PVT. LTD.",
  shortName: "BHUMI",
  tagline: "Built with engineering. Delivered with precision.",
  description:
    "Civil engineering and construction solutions for residential and institutional infrastructure projects in Tulsipur, Dang, Nepal.",
  location: "Tulsipur, Dang, Nepal",
  address: "Tulsipur, Dang, Nepal",
  email: "bhumiconstruction026@gmail.com",
  phone: "9763412459",
  aboutTitle: "About Bhumi Construction",
  aboutContent:
    "Bhumi Design and Construction Pvt. Ltd. is a civil engineering and construction contracting company based in Tulsipur, Dang, Nepal. It is founded and led by Er. Shashiram Nakal, a civil engineering graduate of Pulchowk Campus, Institute of Engineering.\n\nThe company undertakes turnkey and civil contracting works for private residential clients and institutional infrastructure projects, including EIB-financed substation construction under Nepal Electricity Authority's grid expansion program. The portfolio records three site supervisors or overseers across active sites, approximately 40 workers across running sites, and six active sites.\n\nCore competency includes civil and structural works — RCC, masonry, foundation and substation civil works. Design and interior works are executed through vetted specialist partners or subcontractors under BHUMI's supervision.\n\nRegistration No. 376577/82/83 · PAN/VAT No. 622458940",
  logoImage: "/brand/bhumi-wordmark.png",
  heroTitle: "Civil Engineering & Construction Solutions",
  heroDescription:
    "Turnkey and civil contracting works for private residential clients and institutional infrastructure projects.",
  heroImage: "/images/portfolio/murkuti-crb-shuttering-site.png",
  aboutImage: "/images/portfolio/hari-pariyar-complete.jpg",
  socialLinks: {},
  defaultSeoTitle:
    "BHUMI Design & Construction | Civil Engineering & Construction Solutions",
  defaultSeoDescription:
    "BHUMI Design and Construction Pvt. Ltd. provides civil engineering and construction solutions from Tulsipur, Dang, Nepal.",
};

export const portfolioFallbackServices: PublicService[] = [
  {
    id: "fallback-service-turnkey-construction",
    title: "Turnkey Construction",
    slug: "turnkey-construction",
    shortDescription:
      "Turnkey and civil contracting works for private residential clients.",
    description:
      "Turnkey and civil contracting works for private residential clients, managed from construction planning through execution.",
    coverImage: "/images/portfolio/gehendra-oli-proposed-design.jpg",
    icon: null,
    featured: true,
    sortOrder: 0,
  },
  {
    id: "fallback-service-civil-structural-works",
    title: "Civil & Structural Works",
    slug: "civil-structural-works",
    shortDescription: "RCC, masonry and foundation works.",
    description:
      "Civil and structural works including RCC, masonry and foundation work.",
    coverImage: "/images/portfolio/sher-khadka-slab-reinforcement.jpg",
    icon: null,
    featured: true,
    sortOrder: 1,
  },
  {
    id: "fallback-service-substation-civil-works",
    title: "Substation Civil Works",
    slug: "substation-civil-works",
    shortDescription:
      "Civil works for institutional substation infrastructure projects.",
    description:
      "Substation civil works, including control room building and staff-quarter construction for institutional infrastructure projects.",
    coverImage: "/images/portfolio/murkuti-crb-shuttering-site.png",
    icon: null,
    featured: true,
    sortOrder: 2,
  },
  {
    id: "fallback-service-design-interior-works",
    title: "Design & Interior Works",
    slug: "design-interior-works",
    shortDescription:
      "Delivered through vetted specialist partners under BHUMI supervision.",
    description:
      "Design and interior works executed through vetted specialist partners or subcontractors under BHUMI's supervision.",
    coverImage: "/images/portfolio/krishna-oli-proposed-design.jpg",
    icon: null,
    featured: false,
    sortOrder: 3,
  },
];

export const portfolioFallbackProjects: PublicProject[] = [
  {
    id: "fallback-project-murkuti-substation",
    title: "Murkuti Substation — Control Room Building & Staff Quarter",
    slug: "murkuti-substation-control-room-and-staff-quarter",
    category: "Institutional infrastructure",
    location: "Murkuti Substation",
    client: "Nepal Electricity Authority (NEA)",
    mainContractor: "Ethos Power – SIPS JV",
    financing: "EIB (European Investment Bank) — DSUEP EIB-W2 Package",
    description:
      "Construction of the Control Room Building and Staff Quarter for the 33/11 kV Murkuti Substation. The portfolio records casting works for both buildings as completed as of Ashwin 4, 2083, approximately two months into execution.",
    scopeOfWork:
      "Construction of the Control Room Building and Staff Quarter for the 33/11 kV Murkuti Substation.",
    executionDetails:
      "Contract signed: Asar 2083. Work commenced: Shrawan 6, 2083. The site is 25 km off-road from Ghorahi, with drinking water supplied by tanker. The portfolio records labour shortage, material-supply constraints on the off-road access route and two concrete castings completed during monsoon season as key execution conditions.",
    projectStatus:
      "Portfolio status as of Ashwin 4, 2083: CRB and Staff Quarter casting works completed.",
    status: "published",
    startDate: null,
    completionDate: null,
    manpower: "15",
    featured: true,
    coverImage: "/images/portfolio/murkuti-crb-shuttering-site.png",
    sortOrder: 0,
    images: murkutiImages,
  },
  {
    id: "fallback-project-gehendra-oli",
    title: "Gehendra Oli — Four-Storey Residential Building",
    slug: "gehendra-oli-four-storey-residential-building",
    category: "Residential · Turnkey",
    location: "Tulsipur Sub-Metropolitan City, Dang",
    client: "Gehendra Oli",
    mainContractor: null,
    financing: null,
    description:
      "A four-storey residential building delivered under a turnkey contract for Gehendra Oli in Tulsipur Sub-Metropolitan City, Dang. The portfolio records a contract value of NPR 1,20,00,000 and a ten-month construction period.",
    scopeOfWork: "Turnkey construction of a four-storey residential building.",
    executionDetails:
      "The portfolio records foundation and RCC column works completed up to toe-wall level, 20 days after project commencement. Target completion: 2084/03/15 B.S.",
    projectStatus:
      "Portfolio snapshot: foundation and RCC column works completed up to toe-wall level.",
    status: "published",
    startDate: null,
    completionDate: null,
    manpower: null,
    featured: false,
    coverImage: "/images/portfolio/gehendra-oli-proposed-design.jpg",
    sortOrder: 1,
    images: gehendraOliImages,
  },
  {
    id: "fallback-project-krishna-oli",
    title: "Krishna Oli — 1.5-Storey Floor Addition",
    slug: "krishna-oli-floor-addition",
    category: "Residential · Turnkey",
    location: "Tulsipur, Dang",
    client: "Krishna Oli",
    mainContractor: null,
    financing: null,
    description:
      "A 1.5-storey floor addition delivered under a turnkey contract for Krishna Oli in Tulsipur, Dang. The portfolio records a contract value of NPR 50,00,000 and a ten-month construction period.",
    scopeOfWork: "Turnkey construction of a 1.5-storey floor addition.",
    executionDetails:
      "The portfolio records work as having commenced approximately one month earlier, with superstructure works in progress and roof slab shuttering underway.",
    projectStatus:
      "Portfolio snapshot: superstructure works in progress; roof slab shuttering underway.",
    status: "published",
    startDate: null,
    completionDate: null,
    manpower: null,
    featured: false,
    coverImage: "/images/portfolio/krishna-oli-proposed-design.jpg",
    sortOrder: 2,
    images: krishnaOliImages,
  },
  {
    id: "fallback-project-sher-bahadur-khadka",
    title: "Sher Bahadur Khadka — Residential Building",
    slug: "sher-bahadur-khadka-residential-building",
    category: "Residential · Near completion",
    location: "Bijauri, Dang",
    client: "Sher Bahadur Khadka",
    mainContractor: null,
    financing: null,
    description:
      "A residential building delivered under a turnkey contract for Sher Bahadur Khadka in Bijauri, Dang. The portfolio records a contract value of NPR 87,00,000 and a nine-month contract duration.",
    scopeOfWork: "Turnkey construction of a residential building.",
    executionDetails:
      "Contract date: 2082/09/25 B.S. Scheduled completion: 2083/06/25 B.S. The portfolio records plastering and finishing works in progress, near completion.",
    projectStatus:
      "Portfolio snapshot: near completion — finishing works in progress.",
    status: "published",
    startDate: null,
    completionDate: null,
    manpower: null,
    featured: false,
    coverImage: "/images/portfolio/sher-khadka-finishing.jpg",
    sortOrder: 3,
    images: sherKhadkaImages,
  },
  {
    id: "fallback-project-hari-bahadur-pariyar",
    title: "Hari Bahadur Pariyar — Structure Work",
    slug: "hari-bahadur-pariyar-structure-work",
    category: "Residential · Completed",
    location: "Jamani, Dang",
    client: "Hari Bahadur Pariyar",
    mainContractor: null,
    financing: null,
    description:
      "Structure work for Hari Bahadur Pariyar in Jamani, Dang, delivered under a labour contract. The portfolio records a contract value of NPR 20,00,000 and a five-month contract duration.",
    scopeOfWork: "Labour contract for residential structure work.",
    executionDetails:
      "The portfolio records the structure work as completed on schedule.",
    projectStatus: "Completed on schedule.",
    status: "published",
    startDate: null,
    completionDate: null,
    manpower: null,
    featured: false,
    coverImage: "/images/portfolio/hari-pariyar-complete.jpg",
    sortOrder: 4,
    images: hariPariyarImages,
  },
];

function albumImages(
  albumId: string,
  images: PublicProjectImage[],
  sortOffset: number,
): PublicAlbumImage[] {
  return images.map((image) => ({
    id: `${albumId}-${image.id}`,
    image: image.image,
    altText: image.altText,
    caption: image.caption,
    sortOrder: sortOffset + image.sortOrder,
  }));
}

export const portfolioFallbackGalleryAlbums: PublicGalleryAlbum[] = [
  {
    id: "fallback-album-murkuti-substation",
    title: "Murkuti Substation",
    slug: "murkuti-substation",
    description:
      "Control Room Building and Staff Quarter construction at the 33/11 kV Murkuti Substation.",
    coverImage: "/images/portfolio/murkuti-crb-shuttering-site.png",
    category: "Ongoing",
    featured: true,
    sortOrder: 0,
    images: albumImages("fallback-album-murkuti-substation", murkutiImages, 0),
  },
  {
    id: "fallback-album-gehendra-oli",
    title: "Gehendra Oli Residence",
    slug: "gehendra-oli-residence",
    description:
      "Four-storey residential building construction in Tulsipur Sub-Metropolitan City, Dang.",
    coverImage: "/images/portfolio/gehendra-oli-proposed-design.jpg",
    category: "Ongoing",
    featured: true,
    sortOrder: 1,
    images: albumImages("fallback-album-gehendra-oli", gehendraOliImages, 20),
  },
  {
    id: "fallback-album-krishna-oli",
    title: "Krishna Oli Floor Addition",
    slug: "krishna-oli-floor-addition",
    description: "1.5-storey floor-addition project in Tulsipur, Dang.",
    coverImage: "/images/portfolio/krishna-oli-proposed-design.jpg",
    category: "Ongoing",
    featured: false,
    sortOrder: 2,
    images: albumImages("fallback-album-krishna-oli", krishnaOliImages, 40),
  },
  {
    id: "fallback-album-sher-bahadur-khadka",
    title: "Sher Bahadur Khadka Residence",
    slug: "sher-bahadur-khadka-residence",
    description:
      "Residential building construction in Bijauri, Dang, recorded near completion in the portfolio.",
    coverImage: "/images/portfolio/sher-khadka-finishing.jpg",
    category: "Near completion",
    featured: true,
    sortOrder: 3,
    images: albumImages(
      "fallback-album-sher-bahadur-khadka",
      sherKhadkaImages,
      60,
    ),
  },
  {
    id: "fallback-album-hari-bahadur-pariyar",
    title: "Hari Bahadur Pariyar Structure Work",
    slug: "hari-bahadur-pariyar-structure-work",
    description: "Completed residential structure work in Jamani, Dang.",
    coverImage: "/images/portfolio/hari-pariyar-complete.jpg",
    category: "Completed",
    featured: true,
    sortOrder: 4,
    images: albumImages(
      "fallback-album-hari-bahadur-pariyar",
      hariPariyarImages,
      80,
    ),
  },
];

// The portfolio contains no source-supported editorial articles. Keep Insights
// empty until the company publishes its own material through the CMS.
export const portfolioFallbackPosts: PublicPost[] = [];

export function fallbackItems<T>(items: T[], limit?: number): T[] {
  return typeof limit === "number" && limit > 0
    ? items.slice(0, limit)
    : [...items];
}
