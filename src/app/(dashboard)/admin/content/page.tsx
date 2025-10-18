"use client";

import React, { useState } from "react";

import HeroSection from "@/components/dashboard/HeroSection";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import FeaturesGridSection from "@/components/dashboard/FeaturesGridSection";
import PricingSection from "@/components/dashboard/PricingSection";

import {
  heroInitial,
  welcomeInitial,
  featuresInitial,
  pricingInitial,
} from "@/lib/dashboard";
import { supabase } from "@/lib/supabase/client";

export default function ContentPage() {
  const [hero, setHero] = useState({ ...heroInitial });
  const [heroDialogOpen, setHeroDialogOpen] = useState(false);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(hero.image_url);
  const [savingHero, setSavingHero] = useState(false);

  const [welcome, setWelcome] = useState({ ...welcomeInitial });
  const [welcomeDialogOpen, setWelcomeDialogOpen] = useState(false);
  const [welcomeFiles, setWelcomeFiles] = useState<(File | null)[]>(
    Array(4).fill(null)
  );
  const [welcomePreviews, setWelcomePreviews] = useState<string[]>(
    welcome.images.slice()
  );
  const [savingWelcome, setSavingWelcome] = useState(false);

  const [features, setFeatures] = useState([...featuresInitial]);
  const [featuresDialogOpen, setFeaturesDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any>(null);
  const [featureFile, setFeatureFile] = useState<File | null>(null);
  const [featurePreview, setFeaturePreview] = useState<string | null>(null);
  const [savingFeatures, setSavingFeatures] = useState(false);

  const [pricing, setPricing] = useState({ ...pricingInitial });
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);

  const readPreview = (file: File, setter: (s: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (
    folder: string,
    file: File
  ): Promise<string | null> => {
    try {
      const filename = `${Date.now()}-${file.name}`;
      const path = `${folder}/${filename}`;

      const { error } = await supabase.storage
        .from("content")
        .upload(path, file);
      if (error) throw error;

      const { data } = supabase.storage.from("content").getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  // Hero handlers
  const onHeroImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setHeroImageFile(f);
    readPreview(f, setHeroPreview);
  };

  const saveHero = async () => {
    setSavingHero(true);
    try {
      let imageUrl = hero.image_url;
      if (heroImageFile) {
        const uploaded = await uploadImage("hero", heroImageFile);
        if (uploaded) imageUrl = uploaded;
      }

      // Here you would call Supabase insert/update to persist hero section.
      // For now we update local state:
      setHero((prev) => ({ ...prev, image_url: imageUrl }));
      setHeroDialogOpen(false);
    } catch (err) {
      console.error("Save hero error:", err);
      alert("Failed to save hero");
    } finally {
      setSavingHero(false);
      setHeroImageFile(null);
    }
  };

  // Welcome handlers
  const onWelcomeImageSelect = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const arr = [...welcomeFiles];
    arr[index] = f;
    setWelcomeFiles(arr);
    readPreview(f, (src) => {
      const p = [...welcomePreviews];
      p[index] = src;
      setWelcomePreviews(p);
    });
  };

  const saveWelcome = async () => {
    setSavingWelcome(true);
    try {
      const images = [...welcomePreviews];
      for (let i = 0; i < welcomeFiles.length; i++) {
        const f = welcomeFiles[i];
        if (f) {
          const uploaded = await uploadImage("welcome", f);
          if (uploaded) images[i] = uploaded;
        }
      }
      setWelcome((prev) => ({ ...prev, images }));
      setWelcomeDialogOpen(false);
    } catch (err) {
      console.error("Save welcome error:", err);
      alert("Failed to save welcome");
    } finally {
      setSavingWelcome(false);
      setWelcomeFiles(Array(4).fill(null));
    }
  };

  // Features handlers
  const onFeatureImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFeatureFile(f);
    readPreview(f, setFeaturePreview);
  };

  const openCreateFeature = () => {
    setEditingFeature({
      id: `tmp-${Date.now()}`,
      type: "image",
      src: "",
      alt: "",
      bgImage: "",
      icon: "Sparkles",
      title: "",
      description: "",
    });
    setFeaturePreview(null);
    setFeatureFile(null);
    setFeaturesDialogOpen(true);
  };

  const openEditFeature = (f: any) => {
    setEditingFeature({ ...f });
    setFeaturePreview(f.src || f.bgImage || null);
    setFeatureFile(null);
    setFeaturesDialogOpen(true);
  };

  const deleteFeature = (id: string) => {
    if (!confirm("Delete this feature?")) return;
    setFeatures((prev) => prev.filter((p) => p.id !== id));
  };

  const saveFeature = async () => {
    if (!editingFeature) return;
    setSavingFeatures(true);
    try {
      const copy = { ...editingFeature };
      if (featureFile) {
        const uploaded = await uploadImage("features", featureFile);
        if (uploaded) {
          if (copy.type === "image") copy.src = uploaded;
          else copy.bgImage = uploaded;
        }
      }
      setFeatures((prev) => {
        const exists = prev.find((p) => p.id === copy.id);
        if (exists) {
          return prev.map((p) => (p.id === copy.id ? copy : p));
        }
        return [...prev, copy];
      });
      setFeaturesDialogOpen(false);
      setEditingFeature(null);
    } catch (err) {
      console.error("Save feature error:", err);
      alert("Failed to save feature");
    } finally {
      setSavingFeatures(false);
      setFeatureFile(null);
      setFeaturePreview(null);
    }
  };

  // Pricing handlers
  const savePricing = async () => {
    setSavingPricing(true);
    try {
      setPricing((p) => ({ ...p }));
      setPricingDialogOpen(false);
    } catch (err) {
      console.error("Save pricing error:", err);
      alert("Failed to save pricing");
    } finally {
      setSavingPricing(false);
    }
  };

  const updatePricingItem = (
    section: string,
    index: number,
    field: string,
    value: string
  ) => {
    setPricing((prev: any) => {
      const newPricing = { ...prev };
      newPricing[section].items[index][field] = value;
      return newPricing;
    });
  };

  const addPricingItem = (section: string) => {
    setPricing((prev: any) => {
      const newPricing = { ...prev };
      newPricing[section].items.push({
        name: "",
        price: "",
        description: "",
      });
      return newPricing;
    });
  };

  const removePricingItem = (section: string, index: number) => {
    setPricing((prev: any) => {
      const newPricing = { ...prev };
      newPricing[section].items.splice(index, 1);
      return newPricing;
    });
  };

  return (
    <div className="space-y-6">
      <HeroSection
        hero={hero}
        setHero={setHero}
        heroDialogOpen={heroDialogOpen}
        setHeroDialogOpen={setHeroDialogOpen}
        heroPreview={heroPreview}
        setHeroPreview={setHeroPreview}
        setHeroImageFile={setHeroImageFile}
        onHeroImageSelect={onHeroImageSelect}
        saveHero={saveHero}
        savingHero={savingHero}
      />
      <WelcomeSection
        welcome={welcome}
        setWelcome={setWelcome}
        welcomeDialogOpen={welcomeDialogOpen}
        setWelcomeDialogOpen={setWelcomeDialogOpen}
        welcomePreviews={welcomePreviews}
        setWelcomePreviews={setWelcomePreviews}
        welcomeFiles={welcomeFiles}
        setWelcomeFiles={setWelcomeFiles}
        onWelcomeImageSelect={onWelcomeImageSelect}
        saveWelcome={saveWelcome}
        savingWelcome={savingWelcome}
      />
      <FeaturesGridSection
        features={features}
        openCreateFeature={openCreateFeature}
        openEditFeature={openEditFeature}
        deleteFeature={deleteFeature}
        editingFeature={editingFeature}
        setEditingFeature={setEditingFeature}
        featurePreview={featurePreview}
        setFeaturePreview={setFeaturePreview}
        setFeatureFile={setFeatureFile}
        onFeatureImageSelect={onFeatureImageSelect}
        featuresDialogOpen={featuresDialogOpen}
        setFeaturesDialogOpen={setFeaturesDialogOpen}
        saveFeature={saveFeature}
        savingFeatures={savingFeatures}
      />
      <PricingSection
        pricing={pricing}
        setPricing={setPricing}
        pricingDialogOpen={pricingDialogOpen}
        setPricingDialogOpen={setPricingDialogOpen}
        updatePricingItem={updatePricingItem}
        addPricingItem={addPricingItem}
        removePricingItem={removePricingItem}
        savingPricing={savingPricing}
        savePricing={savePricing}
      />
    </div>
  );
}
