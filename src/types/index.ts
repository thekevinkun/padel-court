export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "user" | "admin";
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  court_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  payment_status: "pending" | "paid" | "refunded";
  created_at: string;
}

export interface Court {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  available: boolean;
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

export interface BookingFormData {
  courtId?: string;
  slotId?: string;
  date?: Date;
  numberOfPlayers?: number;
  name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  notes?: string;
  paymentMethod?: string;
  agreeTerms?: boolean;
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
  setWelcomePreviews: React.Dispatch<React.SetStateAction<string[]>>;

  welcomeFiles: (File | null)[];
  setWelcomeFiles: React.Dispatch<React.SetStateAction<(File | null)[]>>;

  onWelcomeImageSelect: (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  saveWelcome: () => Promise<void>;
  savingWelcome: boolean;
}

export type FeatureItem =
  | {
      id: string;
      type: "image";
      src: string;
      alt: string;
    }
  | {
      id: string;
      type: "text";
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

export type ContentSections = {
  hero: HeroContent | null;
  welcome: WelcomeContent | null;
  features: FeaturesContent | null;
  pricing: PricingContent | null;
};

export type Version = {
  id: string;
  version: number;
  content: any;
  changed_by: string | null;
  change_description: string | null;
  created_at: string;
};

export type VersionHistoryDialogProps = {
  sectionType: string;
  currentVersion: number;
  onRestore?: (version: Version) => void;
};