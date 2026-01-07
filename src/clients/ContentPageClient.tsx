"use client";

import React, { useState, useEffect } from "react";

import SectionOrderManager from "@/components/dashboard/SectionOrderManager";
import HeroSection from "@/components/dashboard/HeroSection";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import FeaturesGridSection from "@/components/dashboard/FeaturesGridSection";
import TestimonialsSection from "@/components/dashboard/TestimonialsSection";
import PricingSection from "@/components/dashboard/PricingSection";

import { supabase } from "@/lib/supabase/client";
import {
  heroInitial,
  welcomeInitial,
  featuresInitial,
  testimonialsInitial,
  pricingInitial,
} from "@/lib/constants";
import {
  uploadImage,
  deleteImage,
  extractFilePathFromUrl,
  validateImageFile,
} from "@/lib/upload";

import {
  HeroContent,
  PricingContent,
  WelcomeContent,
  TestimonialsContent,
} from "@/types";

const ContentPageClient = () => {
  const [loading, setLoading] = useState(true);

  /* HERO HANDLERS */
  // Hero state
  const [hero, setHero] = useState<HeroContent>({ ...heroInitial, version: 1 });
  const [heroDialogOpen, setHeroDialogOpen] = useState(false);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(hero.image_url);
  const [savingHero, setSavingHero] = useState(false);

  // Hero functions
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
        // Validate file
        const validation = validateImageFile(heroImageFile, 5);
        if (!validation.isValid) {
          alert(validation.error);
          return;
        }

        const uploaded = await uploadImage("content", heroImageFile, "hero");
        if (uploaded) imageUrl = uploaded;
      }

      const updatedHero = { ...hero, image_url: imageUrl };

      // Save to database
      await saveSectionWithVersion("hero", updatedHero, "Updated hero section");

      setHero({ ...updatedHero, version: hero.version });
      setHeroDialogOpen(false);

      // Trigger revalidation
      await triggerRevalidation();

      console.log("✅ Hero section saved");
    } catch (err) {
      console.error("Save hero error:", err);
      alert("Failed to save hero");
    } finally {
      setSavingHero(false);
      setHeroImageFile(null);
    }
  };

  /* Welcome HANDLERS */
  // Welcome state
  const [welcome, setWelcome] = useState<WelcomeContent>({
    ...welcomeInitial,
    version: 1,
  });
  const [welcomeDialogOpen, setWelcomeDialogOpen] = useState(false);
  const [welcomeFiles, setWelcomeFiles] = useState<(File | null)[]>(
    Array(4).fill(null)
  );
  const [welcomePreviews, setWelcomePreviews] = useState<string[]>(
    welcome.images.slice()
  );
  const [tempWelcomePreviews, setTempWelcomePreviews] = useState<string[]>([]);
  const [savingWelcome, setSavingWelcome] = useState(false);

  // Welcome functions
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

  // When opening dialog, copy current previews to temp
  const openWelcomeDialog = () => {
    setTempWelcomePreviews([...welcomePreviews]); // Copy current to temp
    setWelcomeDialogOpen(true);
  };

  const saveWelcome = async () => {
    setSavingWelcome(true);
    try {
      const images = [...tempWelcomePreviews];
      for (let i = 0; i < welcomeFiles.length; i++) {
        const f = welcomeFiles[i];
        if (f) {
          // Validate each file
          const validation = validateImageFile(f, 5);
          if (!validation.isValid) {
            alert(`Image ${i + 1}: ${validation.error}`);
            continue;
          }

          const uploaded = await uploadImage("content", f, "welcome");
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
      setWelcomePreviews(images);
      setWelcomeDialogOpen(false);

      // Trigger revalidation
      await triggerRevalidation();

      console.log("✅ Welcome section saved");
    } catch (err) {
      console.error("Save welcome error:", err);
      alert("Failed to save welcome");
    } finally {
      setSavingWelcome(false);
      setWelcomeFiles(Array(4).fill(null));
    }
  };

  /* Features HANDLERS */
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

  // Features functions
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
        // Validate file
        const validation = validateImageFile(featureFile, 5);
        if (!validation.isValid) {
          alert(validation.error);
          return;
        }

        const uploaded = await uploadImage("content", featureFile, "features");
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

      // Trigger revalidation
      await triggerRevalidation();

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

  /* Testimonials HANDLERS */
  // Testimonials state
  const [testimonials, setTestimonials] = useState<TestimonialsContent>({
    ...testimonialsInitial,
    version: 1,
  });
  const [testimonialsDialogOpen, setTestimonialsDialogOpen] = useState(false);
  const [testimonialDialogOpen, setTestimonialDialogOpen] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(
    null
  );
  const [savingTestimonials, setSavingTestimonials] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);

  // Testimonials functions
  const onVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setVideoFile(f);
    readPreview(f, setVideoPreview);
  };

  const onBackgroundSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBackgroundFile(f);
    readPreview(f, setBackgroundPreview);
  };

  const saveTestimonials = async () => {
    setSavingTestimonials(true);
    try {
      let videoUrl = testimonials.videoUrl;
      let backgroundImage = testimonials.backgroundImage;

      if (videoFile) {
        // For video, we can skip strict image validation
        // but still check file size
        if (videoFile.size > 50 * 1024 * 1024) {
          // 50MB max for video
          alert("Video file too large. Maximum size is 50MB.");
          return;
        }

        const uploaded = await uploadImage(
          "content",
          videoFile,
          "testimonials"
        );
        if (uploaded) videoUrl = uploaded;
      }

      if (backgroundFile) {
        // Validate background image
        const validation = validateImageFile(backgroundFile, 5);
        if (!validation.isValid) {
          alert(`Background: ${validation.error}`);
          return;
        }

        const uploaded = await uploadImage(
          "content",
          backgroundFile,
          "testimonials"
        );
        if (uploaded) backgroundImage = uploaded;
      }

      const updatedTestimonials = {
        ...testimonials,
        videoUrl,
        backgroundImage,
      };

      await saveSectionWithVersion(
        "testimonials",
        updatedTestimonials,
        "Updated testimonials section"
      );

      setTestimonials({
        ...updatedTestimonials,
        version: testimonials.version,
      });
      setTestimonialsDialogOpen(false);

      await triggerRevalidation();
      console.log("✅ Testimonials section saved");
    } catch (err) {
      console.error("Save testimonials error:", err);
      alert("Failed to save testimonials");
    } finally {
      setSavingTestimonials(false);
      setVideoFile(null);
      setBackgroundFile(null);
    }
  };

  const openAddTestimonial = () => {
    setEditingTestimonial({
      id: `new-${Date.now()}`,
      name: "",
      role: "",
      rating: 5,
      comment: "",
      avatar: null,
      date: new Date().toISOString(),
    });
    setTestimonialDialogOpen(true);
  };

  const openEditTestimonial = (testimonial: any) => {
    setEditingTestimonial({ ...testimonial });
    setTestimonialDialogOpen(true);
  };

  const deleteTestimonial = (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    setTestimonials((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((t) => t.id !== id),
    }));
  };

  const saveTestimonial = async () => {
    if (!editingTestimonial) return;

    setSavingTestimonials(true);
    try {
      const updatedTestimonials = (() => {
        const exists = testimonials.testimonials.find(
          (t) => t.id === editingTestimonial.id
        );
        if (exists) {
          return testimonials.testimonials.map((t) =>
            t.id === editingTestimonial.id ? editingTestimonial : t
          );
        }
        return [...testimonials.testimonials, editingTestimonial];
      })();

      const updatedContent = {
        ...testimonials,
        testimonials: updatedTestimonials,
      };

      await saveSectionWithVersion(
        "testimonials",
        updatedContent,
        editingTestimonial.id.startsWith("new-")
          ? "Added new testimonial"
          : "Updated testimonial"
      );

      setTestimonials({ ...updatedContent, version: testimonials.version });
      setTestimonialDialogOpen(false);
      setEditingTestimonial(null);

      await triggerRevalidation();
      console.log("✅ Testimonial saved");
    } catch (err) {
      console.error("Save testimonial error:", err);
      alert("Failed to save testimonial");
    } finally {
      setSavingTestimonials(false);
    }
  };

  /* PRICING HANDLERS */
  // Pricing state
  const [pricing, setPricing] = useState<PricingContent>({
    ...pricingInitial,
    version: 1,
  });
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);

  // Pricing functions
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

      // Trigger revalidation
      await triggerRevalidation();

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

  /* Fetch all sections from database */
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
            case "testimonials":
              setTestimonials({ ...section.content, version: section.version });
              setVideoPreview(section.content.videoUrl);
              setBackgroundPreview(section.content.backgroundImage);
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

  // Trigger revalidation for every save
  const triggerRevalidation = async () => {
    try {
      const response = await fetch("/api/content/revalidate", {
        method: "POST",
      });

      if (response.ok) {
        console.log("✅ Frontend content revalidated");
      } else {
        console.warn(
          "⚠️ Revalidation failed but content saved:",
          await response.text()
        );
      }
    } catch (error) {
      console.error("Failed to trigger revalidation:", error);
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

  // Fetch all sections from database on mount
  useEffect(() => {
    fetchAllSections();
  }, []);

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
        tempWelcomePreviews={tempWelcomePreviews}
        setTempWelcomePreviews={setTempWelcomePreviews}
        welcomeFiles={welcomeFiles}
        setWelcomeFiles={setWelcomeFiles}
        onWelcomeImageSelect={onWelcomeImageSelect}
        saveWelcome={saveWelcome}
        savingWelcome={savingWelcome}
        openWelcomeDialog={openWelcomeDialog}
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
      <TestimonialsSection
        testimonials={testimonials}
        setTestimonials={setTestimonials}
        testimonialsDialogOpen={testimonialsDialogOpen}
        setTestimonialsDialogOpen={setTestimonialsDialogOpen}
        videoPreview={videoPreview}
        setVideoPreview={setVideoPreview}
        backgroundPreview={backgroundPreview}
        setBackgroundPreview={setBackgroundPreview}
        setVideoFile={setVideoFile}
        setBackgroundFile={setBackgroundFile}
        onVideoSelect={onVideoSelect}
        onBackgroundSelect={onBackgroundSelect}
        saveTestimonials={saveTestimonials}
        savingTestimonials={savingTestimonials}
        testimonialDialogOpen={testimonialDialogOpen}
        setTestimonialDialogOpen={setTestimonialDialogOpen}
        editingTestimonial={editingTestimonial}
        setEditingTestimonial={setEditingTestimonial}
        openAddTestimonial={openAddTestimonial}
        openEditTestimonial={openEditTestimonial}
        deleteTestimonial={deleteTestimonial}
        saveTestimonial={saveTestimonial}
        savingTestimonial={savingTestimonials}
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
};

export default ContentPageClient;
