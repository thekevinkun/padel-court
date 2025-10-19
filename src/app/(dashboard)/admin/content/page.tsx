"use client";

import React, { useState, useEffect } from "react";

import SectionOrderManager from "@/components/dashboard/SectionOrderManager";
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
  const [loading, setLoading] = useState(true);

  // Hero state
  const [hero, setHero] = useState({ ...heroInitial, version: 1 });
  const [heroDialogOpen, setHeroDialogOpen] = useState(false);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(hero.image_url);
  const [savingHero, setSavingHero] = useState(false);

  // Welcome state
  const [welcome, setWelcome] = useState({ ...welcomeInitial, version: 1 });
  const [welcomeDialogOpen, setWelcomeDialogOpen] = useState(false);
  const [welcomeFiles, setWelcomeFiles] = useState<(File | null)[]>(
    Array(4).fill(null)
  );
  const [welcomePreviews, setWelcomePreviews] = useState<string[]>(
    welcome.images.slice()
  );
  const [savingWelcome, setSavingWelcome] = useState(false);

  // Features state
  const [features, setFeatures] = useState({
    items: [...featuresInitial],
    version: 1,
  });
  const [featuresDialogOpen, setFeaturesDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any>(null);
  const [featureFile, setFeatureFile] = useState<File | null>(null);
  const [featurePreview, setFeaturePreview] = useState<string | null>(null);
  const [savingFeatures, setSavingFeatures] = useState(false);

  // Pricing state
  const [pricing, setPricing] = useState({ ...pricingInitial, version: 1 });
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);

  // Fetch all sections from database on mount
  useEffect(() => {
    fetchAllSections();
  }, []);

  const fetchAllSections = async () => {
    try {
      const { data, error } = await supabase
        .from("content_sections")
        .select("*")
        .order("section_order");

      if (error) throw error;

      if (data) {
        // Map database data to state
        data.forEach((section) => {
          switch (section.section_type) {
            case "hero":
              setHero({ ...section.content, version: section.version });
              setHeroPreview(section.content.image_url);
              break;
            case "welcome":
              setWelcome({ ...section.content, version: section.version });
              setWelcomePreviews(section.content.images || []);
              break;
            case "features":
              setFeatures({
                items: section.content.items || [],
                version: section.version,
              });
              break;
            case "pricing":
              setPricing({ ...section.content, version: section.version });
              break;
          }
        });

        console.log("✅ All sections loaded from database");
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
      alert("Failed to load content. Using default values.");
    } finally {
      setLoading(false);
    }
  };

  // Save section with versioning
  const saveSectionWithVersion = async (
    sectionType: string,
    content: any,
    changeDescription?: string
  ) => {
    try {
      // Get current section data
      const { data: currentSection, error: fetchError } = await supabase
        .from("content_sections")
        .select("id, version")
        .eq("section_type", sectionType)
        .single();

      if (fetchError) throw fetchError;

      const newVersion = currentSection.version + 1;

      // First, Create version snapshot (save old content before updating)
      const { data: userData } = await supabase.auth.getUser();

      const { error: versionError } = await supabase
        .from("content_versions")
        .insert({
          section_id: currentSection.id,
          version: currentSection.version,
          content: content, // Save the NEW content as a snapshot
          changed_by: userData?.user?.id || null,
          change_description:
            changeDescription || `Updated ${sectionType} section`,
        });

      if (versionError) throw versionError;

      // Second, Update section with new content and increment version
      const { error: updateError } = await supabase
        .from("content_sections")
        .update({
          content: content,
          version: newVersion,
          updated_at: new Date().toISOString(),
        })
        .eq("section_type", sectionType);

      if (updateError) throw updateError;

      console.log(`✅ ${sectionType} saved with version ${newVersion}`);
      return true;
    } catch (error) {
      console.error("Error saving with version:", error);
      throw error;
    }
  };

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

      const updatedHero = { ...hero, image_url: imageUrl };

      // Save to database
      await saveSectionWithVersion("hero", updatedHero, "Updated hero section");

      setHero({ ...updatedHero, version: hero.version });
      setHeroDialogOpen(false);
      console.log("✅ Hero section saved");
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

      const updatedWelcome = { ...welcome, images };

      // Save to database
      await saveSectionWithVersion(
        "welcome",
        updatedWelcome,
        "Updated welcome section"
      );

      setWelcome({ ...updatedWelcome, version: welcome.version });
      setWelcomeDialogOpen(false);
      console.log("✅ Welcome section saved");
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
    setFeatures((prev) => ({
      ...prev,
      items: prev.items.filter((p) => p.id !== id),
    }));
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

      const updatedFeatures = (() => {
        const exists = features.items.find((p) => p.id === copy.id);
        if (exists) {
          return features.items.map((p) => (p.id === copy.id ? copy : p));
        }
        return [...features.items, copy];
      })();

      const changeDesc = editingFeature.id.startsWith("tmp-")
        ? "Added new feature"
        : "Updated feature";

      await saveSectionWithVersion(
        "features",
        { items: updatedFeatures },
        changeDesc
      );

      // Update state with new items and keep version
      setFeatures({ items: updatedFeatures, version: features.version });
      setFeaturesDialogOpen(false);
      setEditingFeature(null);
      console.log("✅ Features section saved");
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
      // Save to database
      await saveSectionWithVersion(
        "pricing",
        pricing,
        "Updated pricing section"
      );

      setPricingDialogOpen(false);
      console.log("✅ Pricing section saved");
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

  // Show loading spinner while fetching
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionOrderManager />
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
