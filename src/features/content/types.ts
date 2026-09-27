export type SiteContent = {
  companyName: string;
  shortName: string;
  tagline: string;
  description: string;
  location: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  aboutTitle: string | null;
  aboutContent: string | null;
  logoImage: string | null;
  heroImage: string | null;
  aboutImage: string | null;
  socialLinks: Record<string, string>;
};

export type PublicProject = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  location: string | null;
  client: string | null;
  mainContractor: string | null;
  financing: string | null;
  description: string | null;
  scopeOfWork: string | null;
  executionDetails: string | null;
  projectStatus: string | null;
  status: string;
  startDate: string | null;
  completionDate: string | null;
  manpower: string | null;
  featured: boolean;
  coverImage: string | null;
  sortOrder: number;
  images: PublicProjectImage[];
};

export type PublicProjectImage = {
  id: string;
  image: string;
  altText: string | null;
  caption: string | null;
  sortOrder: number;
};

export type PublicService = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  coverImage: string | null;
  icon: string | null;
  featured: boolean;
  sortOrder: number;
};

export type PublicAlbumImage = {
  id: string;
  image: string;
  altText: string | null;
  caption: string | null;
  sortOrder: number;
};

export type PublicGalleryAlbum = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  category: string | null;
  featured: boolean;
  sortOrder: number;
  images: PublicAlbumImage[];
};

export type PublicPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  content: string | null;
  category: string | null;
  tags: string[];
  author: string | null;
  status: string;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};
