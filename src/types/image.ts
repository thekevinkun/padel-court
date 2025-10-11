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