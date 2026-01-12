export interface DashboardStats {
  todayBookings: number;
  todayRevenue: number;
  totalBookings: number;
  availableSlots: number;
  pendingVenuePayments: number;
  pendingVenueAmount: number;
  inProgressSessions?: number;
  upcomingSessions?: number;
  completedToday?: number;
}

export interface Court {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  available: boolean;
  features: string[];
  display_order: number;
  created_at: string;
}

export interface TimeSlot {
  id: string;
  court_id: string;
  date: string;
  time_start: string;
  time_end: string;
  period: "peak" | "off-peak";
  price_per_person: number;
  available: boolean;
}

interface CTA {
  text: string;
  href: string;
}

interface StatItem {
  number: string;
  label: string;
}

export interface HeroContent {
  version?: number;
  badge: string;
  title: string;
  subtitle: string;
  ctaPrimary: CTA;
  ctaSecondary: CTA;
  image_url: string;
  stats: StatItem[];
}

export interface HeroSectionCMS {
  hero: HeroContent;
  setHero: React.Dispatch<React.SetStateAction<HeroContent>>;

  heroDialogOpen: boolean;
  setHeroDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;

  heroPreview: string | null;
  setHeroPreview: React.Dispatch<React.SetStateAction<string | null>>;

  setHeroImageFile: React.Dispatch<React.SetStateAction<File | null>>;

  onHeroImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;

  saveHero: () => Promise<void>;
  savingHero: boolean;
}

interface WelcomeFeatureItem {
  icon: string;
  title: string;
  desc: string;
}

export interface WelcomeContent {
  version?: number;
  badge: string;
  heading: string;
  description: string;
  images: string[];
  features: WelcomeFeatureItem[];
  cta: CTA;
}

export interface WelcomeSectionCMS {
  welcome: WelcomeContent;
  setWelcome: React.Dispatch<React.SetStateAction<WelcomeContent>>;

  welcomeDialogOpen: boolean;
  setWelcomeDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;

  welcomePreviews: string[];
  setWelcomePreviews?: React.Dispatch<React.SetStateAction<string[]>>;

  tempWelcomePreviews: string[];
  setTempWelcomePreviews: React.Dispatch<React.SetStateAction<string[]>>;

  welcomeFiles: (File | null)[];
  setWelcomeFiles: React.Dispatch<React.SetStateAction<(File | null)[]>>;

  onWelcomeImageSelect: (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  saveWelcome: () => Promise<void>;
  savingWelcome: boolean;

  openWelcomeDialog: () => void;
}

export type FeatureItem =
  | {
      id: string;
      type: "image";
      src: string;
      alt: string;
      bgImage?: string;
      icon?: string;
      title?: string;
      description?: string;
    }
  | {
      id: string;
      type: "text";
      src?: string;
      alt?: string;
      bgImage: string;
      icon: string;
      title: string;
      description: string;
    };

export type FeaturesContent = {
  items: FeatureItem[];
};

export interface FeaturesGridSectionCMS {
  features: {
    items: FeatureItem[];
    version: number;
  };
  openCreateFeature: () => void;
  openEditFeature: (f: FeatureItem) => void;
  deleteFeature: (id: string) => void;

  editingFeature: FeatureItem | null;
  setEditingFeature: React.Dispatch<React.SetStateAction<FeatureItem | null>>;

  featurePreview: string | null;
  setFeaturePreview: React.Dispatch<React.SetStateAction<string | null>>;
  setFeatureFile: React.Dispatch<React.SetStateAction<File | null>>;

  onFeatureImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;

  featuresDialogOpen: boolean;
  setFeaturesDialogOpen: (v: boolean) => void;

  saveFeature: () => Promise<void>;
  savingFeatures: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  rating: number;
  comment: string;
  avatar?: string | null;
  date?: string;
}

export interface TestimonialsContent {
  version?: number;
  badge: string;
  heading: string;
  description: string;
  videoUrl: string;
  backgroundImage: string;
  testimonials: Testimonial[];
}

export interface TestimonialsSectionCMS {
  testimonials: TestimonialsContent;
  setTestimonials: React.Dispatch<React.SetStateAction<TestimonialsContent>>;
  testimonialsDialogOpen: boolean;
  setTestimonialsDialogOpen: (open: boolean) => void;
  videoPreview: string | null;
  setVideoPreview: (preview: string | null) => void;
  backgroundPreview: string | null;
  setBackgroundPreview: (preview: string | null) => void;
  setVideoFile: (file: File | null) => void;
  setBackgroundFile: (file: File | null) => void;
  onVideoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBackgroundSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveTestimonials: () => Promise<void>;
  savingTestimonials: boolean;
  testimonialDialogOpen: boolean;
  setTestimonialDialogOpen: (open: boolean) => void;
  editingTestimonial: Testimonial | null;
  setEditingTestimonial: (testimonial: Testimonial | null) => void;
  openAddTestimonial: () => void;
  openEditTestimonial: (testimonial: Testimonial) => void;
  deleteTestimonial: (id: string) => void;
  saveTestimonial: () => Promise<void>;
  savingTestimonial: boolean;
}

export interface PricingItem {
  name: string;
  price: string;
  description: string;
}

export interface PricingSubSection {
  title: string;
  subtitle?: string;
  items: PricingItem[];
}

export interface PricingContent {
  version?: number;
  badge: string;
  heading: string;
  description: string;
  notes: string[];
  courtRental: {
    peakHours: PricingSubSection;
    offPeakHours: PricingSubSection;
  };
  headCoach: PricingSubSection;
  seniorCoach: PricingSubSection;
  juniorCoach: PricingSubSection;
  racketRental: PricingSubSection;
}

export interface PricingSectionCMS {
  pricing: PricingContent;
  setPricing: React.Dispatch<React.SetStateAction<PricingContent>>;

  pricingDialogOpen: boolean;
  setPricingDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;

  updatePricingItem: (
    section: string,
    index: number,
    field: keyof PricingItem,
    value: string
  ) => void;

  addPricingItem: (section: string) => void;
  removePricingItem: (section: string, index: number) => void;

  savingPricing: boolean;
  savePricing: () => Promise<void>;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

export interface GalleryNote {
  title: string;
  description: string;
}

export interface GalleryContent {
  version?: number;
  badge: string;
  heading: string;
  description: string;
  images: GalleryImage[];
  note: GalleryNote;
}

export interface GallerySectionCMS {
  gallery: GalleryContent;
  setGallery: (gallery: GalleryContent) => void;
  galleryDialogOpen: boolean;
  setGalleryDialogOpen: (open: boolean) => void;
  imageDialogOpen: boolean;
  setImageDialogOpen: (open: boolean) => void;
  noteDialogOpen: boolean;
  setNoteDialogOpen: (open: boolean) => void;
  editingImage: GalleryImage | null;
  setEditingImage: (image: GalleryImage | null) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openAddImage: () => void;
  openEditImage: (image: GalleryImage) => void;
  deleteImage: (id: string) => void;
  saveImage: () => Promise<void>;
  saveNote: () => Promise<void>;
  savingGallery: boolean;
}

export interface CTAContent {
  version?: number;
  backgroundImage: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

export interface CTASectionCMS {
  cta: CTAContent;
  setCta: (cta: CTAContent) => void;
  ctaDialogOpen: boolean;
  setCtaDialogOpen: (open: boolean) => void;
  backgroundPreview: string | null;
  setBackgroundPreview: (preview: string | null) => void;
  setBackgroundFile: (file: File | null) => void;
  onBackgroundSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveCta: () => void;
  savingCta: boolean;
}

export type ContentSections = {
  hero: HeroContent | null;
  welcome: WelcomeContent | null;
  features: FeaturesContent | null;
  testimonials: TestimonialsContent | null;
  pricing: PricingContent | null;
  gallery: GalleryContent | null;
  cta: CTAContent | null;
};

export type Version = {
  id: string;
  version: number;
  content: unknown;
  changed_by: string | null;
  change_description: string | null;
  created_at: string;
};

export type VersionHistoryDialogProps = {
  sectionType: string;
  currentVersion: number;
  onRestore?: (version: Version) => void;
};
