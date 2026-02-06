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
  todayRefunds?: number;
  todayRefundAmount?: number;
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
  setHero?: (hero: HeroContent) => void;
  tempHero: HeroContent;
  setTempHero: (hero: HeroContent) => void;
  heroDialogOpen: boolean;
  openHeroDialog: () => void;
  setHeroDialogOpen: (open: boolean) => void;

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
  setWelcome: (welcome: WelcomeContent) => void;

  welcomeDialogOpen: boolean;
  setWelcomeDialogOpen: (open: boolean) => void;

  welcomePreviews: string[];
  setWelcomePreviews?: (previews: string[]) => void;

  tempWelcomePreviews: string[];
  setTempWelcomePreviews: (previews: string[]) => void;

  welcomeFiles: (File | null)[];
  setWelcomeFiles: React.Dispatch<React.SetStateAction<(File | null)[]>>;

  onWelcomeImageSelect: (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
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
  setTestimonials: (testimonials: TestimonialsContent) => void;
  tempTestimonials: TestimonialsContent;
  setTempTestimonials: (testimonials: TestimonialsContent) => void;
  openTestimonialsDialog: () => void;
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
  setPricing?: (pricing: PricingContent) => void;
  tempPricing: PricingContent;
  setTempPricing: (pricing: PricingContent) => void;
  pricingDialogOpen: boolean;
  setPricingDialogOpen: (open: boolean) => void;
  openPricingDialog: () => void;
  updatePricingItem: (
    section: string,
    index: number,
    field: keyof PricingItem,
    value: string,
  ) => void;

  addPricingItem: (section: string) => void;
  removePricingItem: (section: string, index: number) => void;

  updatePricingNote: (index: number, value: string) => void;
  addPricingNote: () => void;
  removePricingNote: (index: number) => void;

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
  tempGallery: GalleryContent;
  setTempGallery: (gallery: GalleryContent) => void;
  openGalleryDialog: () => void;
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
  tempCta: CTAContent;
  setTempCta: (cta: CTAContent) => void;
  openCtaDialog: () => void;
  ctaDialogOpen: boolean;
  setCtaDialogOpen: (open: boolean) => void;
  backgroundPreview: string | null;
  setBackgroundPreview: (preview: string | null) => void;
  setBackgroundFile: (file: File | null) => void;
  onBackgroundSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveCta: () => void;
  savingCta: boolean;
}

export interface PageHero {
  id: string;
  page_slug: "activities" | "courts" | "shop" | "pricing" | "contact";
  title: string;
  subtitle?: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PageHeroContent {
  title: string;
  subtitle?: string;
  image_url: string;
}

export interface PageHeroSectionCMS {
  pageHeroes: PageHero[];
  editingPageHero: PageHero | null;
  setEditingPageHero: (hero: PageHero | null) => void;
  pageHeroDialogOpen: boolean;
  setPageHeroDialogOpen: (open: boolean) => void;
  pageHeroImageFile: File | null;
  setPageHeroImageFile: (file: File | null) => void;
  pageHeroPreview: string | null;
  setPageHeroPreview: (preview: string | null) => void;
  onPageHeroImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openEditPageHero: (hero: PageHero) => void;
  savePageHero: () => Promise<void>;
  savingPageHero: boolean;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ActivitiesSectionCMS {
  activities: Activity[];
  editingActivity: Activity | null;
  setEditingActivity: (activity: Activity | null) => void;
  activityDialogOpen: boolean;
  setActivityDialogOpen: (open: boolean) => void;
  activityImageFile: File | null;
  setActivityImageFile: (file: File | null) => void;
  activityPreview: string | null;
  setActivityPreview: (preview: string | null) => void;
  onActivityImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openAddActivity: () => void;
  openEditActivity: (activity: Activity) => void;
  deleteActivity: (id: string) => void;
  saveActivity: () => Promise<void>;
  savingActivity: boolean;
}

export interface ShopProduct {
  id: string;
  name: string;
  caption: string; // Short caption for hover
  image_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  // Welcome
  welcome_badge: string;
  welcome_heading: string;
  welcome_description: string;
  welcome_image_1: string;
  welcome_image_2: string;
  welcome_subheading: string;
  welcome_subdescription: string;
  // CTAs
  cta_primary_text: string;
  cta_primary_href: string;
  cta_secondary_text: string;
  cta_secondary_href: string;
  // Products section
  products: ShopProduct[];
  created_at: string;
  updated_at: string;
}

export interface ShopWelcomeContent {
  badge: string;
  heading: string;
  description: string;
  images: [string, string]; // [image_1, image_2]
  subheading: string;
  subdescription: string;
  cta: {
    primary: { text: string; href: string };
    secondary: { text: string; href: string };
  };
}

export interface ShopSectionCMS {
  shop: Shop;
  setShop: (shop: Shop) => void;
  tempShop: Shop;
  setTempShop: (shop: Shop) => void;

  // Welcome dialog
  shopWelcomeDialogOpen: boolean;
  setShopWelcomeDialogOpen: (open: boolean) => void;
  shopWelcomeFiles: [File | null, File | null];
  setShopWelcomeFiles: (files: [File | null, File | null]) => void;
  shopWelcomePreviews: [string, string];
  tempShopWelcomePreviews: [string, string];
  setTempShopWelcomePreviews: (previews: [string, string]) => void;
  onShopWelcomeImageSelect: (
    index: 0 | 1,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  saveShopWelcome: () => Promise<void>;
  savingShopWelcome: boolean;
  openShopWelcomeDialog: () => void;

  // Product dialog
  editingShopProduct: ShopProduct | null;
  setEditingShopProduct: (product: ShopProduct | null) => void;
  shopProductDialogOpen: boolean;
  setShopProductDialogOpen: (open: boolean) => void;
  shopProductImageFile: File | null;
  setShopProductImageFile: (file: File | null) => void;
  shopProductPreview: string | null;
  setShopProductPreview: (preview: string | null) => void;
  onShopProductImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openAddShopProduct: () => void;
  openEditShopProduct: (product: ShopProduct) => void;
  deleteShopProduct: (id: string) => void;
  saveShopProduct: () => Promise<void>;
  savingShopProduct: boolean;
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
