import { LucideIcon } from "lucide-react";

type ImageFeature = {
  type: "image";
  src: string;
  alt: string;
};

type TextFeature = {
  type: "text";
  icon: LucideIcon;
  title: string;
  description: string;
  bgImage: string;
};

export type Feature = ImageFeature | TextFeature;

export interface PricingItem {
  name: string;
  price: string;
  description?: string;
}

export interface PricingSection {
  id: string;
  title: string;
  subtitle?: string;
  items: PricingItem[];
}

export interface CoachingPackage {
  title: string;
  items: PricingItem[];
}