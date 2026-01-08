"use client";

import React, { useState, useEffect } from "react";

import SectionOrderManager from "@/components/dashboard/SectionOrderManager";
import HeroSection from "@/components/dashboard/HeroSection";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import FeaturesGridSection from "@/components/dashboard/FeaturesGridSection";
import TestimonialsSection from "@/components/dashboard/TestimonialsSection";
import PricingSection from "@/components/dashboard/PricingSection";
import GallerySection from "@/components/dashboard/GallerySection";
import CTASection from "@/components/dashboard/CTASection";

import { supabase } from "@/lib/supabase/client";
import {
  heroInitial,
  welcomeInitial,
  featuresInitial,
  testimonialsInitial,
  pricingInitial,
  galleryInitial,
  ctaInitial,
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
  GalleryContent,
  GalleryImage,
  CTAContent,
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

    // Validate file before setting
    const validation = validateImageFile(f, 5);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setHeroImageFile(f);
    readPreview(f, setHeroPreview);
  };

  const saveHero = async () => {
    setSavingHero(true);
    try {
      let imageUrl = hero.image_url;

      if (heroImageFile) {
        // Delete old image if updating
        if (hero.image_url) {
          const oldFilePath = extractFilePathFromUrl(hero.image_url, "content");
          if (oldFilePath) {
            await deleteImage("content", oldFilePath);
            console.log("🗑️ Old hero image deleted");
          }
        }

        // Upload new image to content/hero/
        const uploaded = await uploadImage("content", heroImageFile, "hero");
        if (!uploaded) {
          throw new Error("Failed to upload image. Please try again.");
        }
        imageUrl = uploaded;
      }

      const updatedHero = { ...hero, image_url: imageUrl };

      await saveSectionWithVersion("hero", updatedHero, "Updated hero section");
      setHero({ ...updatedHero, version: hero.version });
      setHeroDialogOpen(false);
      await triggerRevalidation();

      console.log("✅ Hero section saved");
    } catch (err) {
      console.error("Save hero error:", err);
      alert(
        `Failed to save hero: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
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

    // Validate file before setting
    const validation = validateImageFile(f, 5);
    if (!validation.isValid) {
      alert(`Image ${index + 1}: ${validation.error}`);
      return;
    }

    const arr = [...welcomeFiles];
    arr[index] = f;
    setWelcomeFiles(arr);

    // READ PREVIEW INTO TEMP PREVIEWS (NOT welcomePreviews!)
    readPreview(f, (src) => {
      const p = [...tempWelcomePreviews]; // Use tempWelcomePreviews
      p[index] = src;
      setTempWelcomePreviews(p); // Update temp, not main previews
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
          // Delete old image if updating this slot
          if (welcome.images[i]) {
            const oldFilePath = extractFilePathFromUrl(
              welcome.images[i],
              "content"
            );
            if (oldFilePath) {
              await deleteImage("content", oldFilePath);
              console.log(`🗑️ Old welcome image ${i + 1} deleted`);
            }
          }

          // Upload new image to content/welcome/
          const uploaded = await uploadImage("content", f, "welcome");
          if (!uploaded) {
            throw new Error(`Failed to upload image ${i + 1}`);
          }
          images[i] = uploaded;
        }
      }

      const updatedWelcome = { ...welcome, images };

      await saveSectionWithVersion(
        "welcome",
        updatedWelcome,
        "Updated welcome section"
      );

      setWelcome({ ...updatedWelcome, version: welcome.version });
      setWelcomePreviews(images);
      setWelcomeDialogOpen(false);
      await triggerRevalidation();

      console.log("✅ Welcome section saved");
    } catch (err) {
      console.error("Save welcome error:", err);
      alert(
        `Failed to save welcome: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
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

    // Validate file before setting
    const validation = validateImageFile(f, 5);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

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
        // Delete old image if updating
        const oldImageUrl = copy.type === "image" ? copy.src : copy.bgImage;
        if (oldImageUrl) {
          const oldFilePath = extractFilePathFromUrl(oldImageUrl, "content");
          if (oldFilePath) {
            await deleteImage("content", oldFilePath);
            console.log("🗑️ Old feature image deleted");
          }
        }

        // Upload new image to content/features/
        const uploaded = await uploadImage("content", featureFile, "features");
        if (!uploaded) {
          throw new Error("Failed to upload image. Please try again.");
        }

        if (copy.type === "image") copy.src = uploaded;
        else copy.bgImage = uploaded;
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
      setFeatures({ items: updatedFeatures, version: features.version });
      setFeaturesDialogOpen(false);
      setEditingFeature(null);
      await triggerRevalidation();

      console.log("✅ Features section saved");
    } catch (err) {
      console.error("Save feature error:", err);
      alert(
        `Failed to save feature: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
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
  const [testimonialsVideoFile, setTestimonialsVideoFile] =
    useState<File | null>(null);
  const [testimonialsVideoPreview, setTestimonialsVideoPreview] = useState<
    string | null
  >(null);
  const [testimonialsBackgroundFile, setTestimonialsBackgroundFile] =
    useState<File | null>(null);
  const [testimonialsBackgroundPreview, setTestimonialsBackgroundPreview] =
    useState<string | null>(null);
  const [savingTestimonials, setSavingTestimonials] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);

  // Testimonials functions
  const onTestimonialsVideoSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Check video file size (50MB max)
    if (f.size > 50 * 1024 * 1024) {
      alert("Video file too large. Maximum size is 50MB.");
      return;
    }

    setTestimonialsVideoFile(f);
    readPreview(f, setTestimonialsVideoPreview);
  };

  const onTestimonialsBackgroundSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Validate background image
    const validation = validateImageFile(f, 5);
    if (!validation.isValid) {
      alert(`Background: ${validation.error}`);
      return;
    }

    setTestimonialsBackgroundFile(f);
    readPreview(f, setTestimonialsBackgroundPreview);
  };

  const saveTestimonials = async () => {
    setSavingTestimonials(true);
    try {
      let videoUrl = testimonials.videoUrl;
      let backgroundImage = testimonials.backgroundImage;

      if (testimonialsVideoFile) {
        // Delete old video if updating
        if (testimonials.videoUrl) {
          const oldFilePath = extractFilePathFromUrl(
            testimonials.videoUrl,
            "content"
          );
          if (oldFilePath) {
            await deleteImage("content", oldFilePath);
            console.log("🗑️ Old testimonials video deleted");
          }
        }

        // Upload new video to content/testimonials/
        const uploaded = await uploadImage(
          "content",
          testimonialsVideoFile,
          "testimonials"
        );
        if (!uploaded) {
          throw new Error("Failed to upload video. Please try again.");
        }
        videoUrl = uploaded;
      }

      if (testimonialsBackgroundFile) {
        // Delete old background if updating
        if (testimonials.backgroundImage) {
          const oldFilePath = extractFilePathFromUrl(
            testimonials.backgroundImage,
            "content"
          );
          if (oldFilePath) {
            await deleteImage("content", oldFilePath);
            console.log("🗑️ Old testimonials background deleted");
          }
        }

        // Upload new background to content/testimonials/
        const uploaded = await uploadImage(
          "content",
          testimonialsBackgroundFile,
          "testimonials"
        );
        if (!uploaded) {
          throw new Error("Failed to upload background. Please try again.");
        }
        backgroundImage = uploaded;
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
      alert(
        `Failed to save testimonials: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setSavingTestimonials(false);
      setTestimonialsVideoFile(null);
      setTestimonialsBackgroundFile(null);
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
      alert(
        `Failed to save testimonial: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
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

  /* GALLERY HANDLERS */
  // Gallery state
  const [gallery, setGallery] = useState<GalleryContent>({
    ...galleryInitial,
    version: 1,
  });
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false);
  const [galleryImageDialogOpen, setGalleryImageDialogOpen] = useState(false);
  const [galleryNoteDialogOpen, setGalleryNoteDialogOpen] = useState(false);
  const [editingGalleryImage, setEditingGalleryImage] =
    useState<GalleryImage | null>(null);
  const [galleryImageFile, setGalleryImageFile] = useState<File | null>(null);
  const [galleryImagePreview, setGalleryImagePreview] = useState<string | null>(
    null
  );
  const [savingGallery, setSavingGallery] = useState(false);

  // Gallery functions
  const onGalleryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Validate file before setting
    const validation = validateImageFile(f, 5);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setGalleryImageFile(f);
    readPreview(f, setGalleryImagePreview);
  };

  const openAddGalleryImage = () => {
    setEditingGalleryImage({
      id: `new-${Date.now()}`,
      url: "",
      alt: "",
      caption: "",
    });
    setGalleryImagePreview(null);
    setGalleryImageFile(null);
    setGalleryImageDialogOpen(true);
  };

  const openEditGalleryImage = (image: GalleryImage) => {
    setEditingGalleryImage({ ...image });
    setGalleryImagePreview(image.url);
    setGalleryImageFile(null);
    setGalleryImageDialogOpen(true);
  };

  const deleteGalleryImage = (id: string) => {
    if (!confirm("Delete this image from gallery?")) return;
    setGallery((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  const saveGalleryImage = async () => {
    if (!editingGalleryImage) return;
    setSavingGallery(true);

    try {
      const copy = { ...editingGalleryImage };

      if (galleryImageFile) {
        // Delete old image if updating
        if (copy.url && !copy.id.startsWith("new-")) {
          const oldFilePath = extractFilePathFromUrl(copy.url, "content");
          if (oldFilePath) {
            await deleteImage("content", oldFilePath);
            console.log("🗑️ Old gallery image deleted");
          }
        }

        // Upload new image to content/gallery/
        const uploaded = await uploadImage(
          "content",
          galleryImageFile,
          "gallery"
        );
        if (!uploaded) {
          throw new Error("Failed to upload image. Please try again.");
        }
        copy.url = uploaded;
      }

      // Validate required fields
      if (!copy.url || !copy.alt) {
        alert("Image and Alt text are required");
        setSavingGallery(false);
        return;
      }

      // Update or add image
      const updatedImages = (() => {
        const exists = gallery.images.find((img) => img.id === copy.id);
        if (exists) {
          return gallery.images.map((img) => (img.id === copy.id ? copy : img));
        }
        return [...gallery.images, copy];
      })();

      const changeDesc = editingGalleryImage.id.startsWith("new-")
        ? "Added new gallery image"
        : "Updated gallery image";

      await saveSectionWithVersion(
        "gallery",
        { ...gallery, images: updatedImages },
        changeDesc
      );
      setGallery({
        ...gallery,
        images: updatedImages,
        version: gallery.version,
      });
      setGalleryImageDialogOpen(false);
      setEditingGalleryImage(null);
      setGalleryImagePreview(null);
      setGalleryImageFile(null);
      await triggerRevalidation();

      console.log("✅ Gallery image saved");
    } catch (err) {
      console.error("Save gallery image error:", err);
      alert(
        `Failed to save image: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setSavingGallery(false);
    }
  };

  const saveGalleryNote = async () => {
    if (!gallery.note.title || !gallery.note.description) {
      alert("Note title and description are required");
      return;
    }

    setSavingGallery(true);
    try {
      // Save to database
      await saveSectionWithVersion(
        "gallery",
        gallery,
        "Updated gallery section"
      );

      setGalleryNoteDialogOpen(false);
      setGalleryDialogOpen(false);

      // Trigger revalidation
      await triggerRevalidation();
      console.log("✅ Gallery note saved");
    } catch (err) {
      console.error("Save gallery note error:", err);
      alert("Failed to save note");
    } finally {
      setSavingGallery(false);
    }
  };

  /* CTA HANDLERS */
  // CTA state
  const [cta, setCta] = useState<CTAContent>({
    ...ctaInitial,
    version: 1,
  });
  const [ctaDialogOpen, setCtaDialogOpen] = useState(false);
  const [ctaBackgroundFile, setCtaBackgroundFile] = useState<File | null>(null);
  const [ctaBackgroundPreview, setCtaBackgroundPreview] = useState<
    string | null
  >(null);
  const [savingCta, setSavingCta] = useState(false);

  // CTA functions
  const onCtaBackgroundSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Validate file before setting
    const validation = validateImageFile(f, 5);
    if (!validation.isValid) {
      alert(`Background: ${validation.error}`);
      return;
    }

    setCtaBackgroundFile(f);
    readPreview(f, setCtaBackgroundPreview);
  };

  const saveCta = async () => {
    if (!cta.title || !cta.subtitle || !cta.buttonText || !cta.buttonLink) {
      alert("All fields are required");
      return;
    }

    setSavingCta(true);
    try {
      let backgroundImage = cta.backgroundImage;

      // Upload new background image if selected
      if (ctaBackgroundFile) {
        // Delete old image if updating
        if (cta.backgroundImage) {
          const oldFilePath = extractFilePathFromUrl(
            cta.backgroundImage,
            "content"
          );
          if (oldFilePath) {
            await deleteImage("content", oldFilePath);
            console.log("🗑 Old CTA background deleted");
          }
        }

        // Upload new image to content/cta/
        const uploaded = await uploadImage("content", ctaBackgroundFile, "cta");
        if (!uploaded) {
          throw new Error("Failed to upload background. Please try again.");
        }
        backgroundImage = uploaded;
      }

      const updatedCta = {
        ...cta,
        backgroundImage,
      };

      // Save to database
      await saveSectionWithVersion("cta", updatedCta, "Updated CTA section");

      setCta({ ...updatedCta, version: cta.version });
      setCtaDialogOpen(false);

      // Trigger revalidation
      await triggerRevalidation();
      console.log("✅ CTA section saved");
    } catch (err) {
      console.error("Save CTA error:", err);
      alert(
        `Failed to save CTA: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setSavingCta(false);
      setCtaBackgroundFile(null);
    }
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
              setTestimonialsVideoPreview(section.content.videoUrl);
              setTestimonialsBackgroundPreview(section.content.backgroundImage);
              break;
            case "pricing":
              setPricing({ ...section.content, version: section.version });
              break;
            case "gallery":
              setGallery({ ...section.content, version: section.version });
              break;
            case "cta":
              setCta({ ...section.content, version: section.version });
              setCtaBackgroundPreview(section.content.backgroundImage);
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
        videoPreview={testimonialsVideoPreview}
        setVideoPreview={setTestimonialsVideoPreview}
        backgroundPreview={testimonialsBackgroundPreview}
        setBackgroundPreview={setTestimonialsBackgroundPreview}
        setVideoFile={setTestimonialsVideoFile}
        setBackgroundFile={setTestimonialsBackgroundFile}
        onVideoSelect={onTestimonialsVideoSelect}
        onBackgroundSelect={onTestimonialsBackgroundSelect}
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
      <GallerySection
        gallery={gallery}
        setGallery={setGallery}
        galleryDialogOpen={galleryDialogOpen}
        setGalleryDialogOpen={setGalleryDialogOpen}
        imageDialogOpen={galleryImageDialogOpen}
        setImageDialogOpen={setGalleryImageDialogOpen}
        noteDialogOpen={galleryNoteDialogOpen}
        setNoteDialogOpen={setGalleryNoteDialogOpen}
        editingImage={editingGalleryImage}
        setEditingImage={setEditingGalleryImage}
        imageFile={galleryImageFile}
        setImageFile={setGalleryImageFile}
        imagePreview={galleryImagePreview}
        setImagePreview={setGalleryImagePreview}
        onImageSelect={onGalleryImageSelect}
        openAddImage={openAddGalleryImage}
        openEditImage={openEditGalleryImage}
        deleteImage={deleteGalleryImage}
        saveImage={saveGalleryImage}
        saveNote={saveGalleryNote}
        savingGallery={savingGallery}
      />
      <CTASection
        cta={cta}
        setCta={setCta}
        ctaDialogOpen={ctaDialogOpen}
        setCtaDialogOpen={setCtaDialogOpen}
        backgroundPreview={ctaBackgroundPreview}
        setBackgroundPreview={setCtaBackgroundPreview}
        setBackgroundFile={setCtaBackgroundFile}
        onBackgroundSelect={onCtaBackgroundSelect}
        saveCta={saveCta}
        savingCta={savingCta}
      />
    </div>
  );
};

export default ContentPageClient;
