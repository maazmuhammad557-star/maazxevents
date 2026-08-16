export interface ThemeItem {
  id: number;
  title: string;
  price: string;
  actualPrice: string;
  image: string;
  gallery: string[];
  description: string;
  category: string;
  attributes: { label: string; value: string }[];
}

export interface SiteContent {
  header: {
    logo: string;
    bookAppointmentUrl: string;
    phone: string;
  };
  hero: {
    title: string;
    subtitle: string;
    bgImage: string;
    exploreButtonText: string;
    radialItems: { title: string; angle: number }[];
  };
  whyChooseUs: {
    sectionTag: string;
    title: string;
    beforeImage: string;
    afterImage: string;
    sliderTitle: string;
    sliderSub: string;
    fastBookingTitle: string;
    fastBookingDesc: string;
    stressFreeTitle: string;
    stressFreeImage: string;
    tailoredTitle: string;
    tailoredDesc: string;
    tailoredImages: string[];
    floralArchImage: string;
    setupsCountValue: string;
    setupsCountSub: string;
    setupsCountBadge: string;
    setupsCountBgText: string;
    reviewsRatingText: string;
    reviewsSubText: string;
    testimonials: {
      name: string;
      role: string;
      image: string;
      quote?: string;
    }[];
  };
  aboutUs: {
    sectionTag: string;
    title: string;
    desc1: string;
    desc2: string;
    image1: string;
    image2: string;
    stats: { value: string; label: string }[];
    ctaText: string;
  };
  footer: {
    logo: string;
    description: string;
    location: string;
    phone: string;
    email: string;
    facebookUrl: string;
    instagramUrl: string;
    copyright: string;
  };
  themesSection: {
    categories: string[];
    subcategories: Record<string, string[]>;
    items: ThemeItem[];
  };
}
