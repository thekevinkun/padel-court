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