"use client";

import Image from "next/image";
import { Edit, Upload, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { PageHeroSectionCMS } from "@/types";

const PAGE_LABELS: Record<string, string> = {
  activities: "Activities Page",
  courts: "Courts Page",
  shop: "Shop Page",
  pricing: "Pricing Page",
  contact: "Contact Page",
};

const PageHeroesSection = ({
  pageHeroes,
  editingPageHero,
  setEditingPageHero,
  pageHeroDialogOpen,
  setPageHeroDialogOpen,
  pageHeroImageFile,
  setPageHeroImageFile,
  pageHeroPreview,
  setPageHeroPreview,
  onPageHeroImageSelect,
  openEditPageHero,
  savePageHero,
  savingPageHero,
}: PageHeroSectionCMS) => {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Page Heroes</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Hero sections for all pages (Activities, Courts, Shop, Pricing,
                Contact)
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pageHeroes.map((hero) => (
              <Card key={hero.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row gap-4 p-4">
                    {/* Image Preview */}
                    <div className="relative w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {hero.image_url ? (
                        <Image
                          src={hero.image_url}
                          alt={hero.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 192px"
                          quality={75}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {PAGE_LABELS[hero.page_slug]}
                        </Badge>
                        <Button
                          onClick={() => openEditPageHero(hero)}
                          size="sm"
                          className="gap-2"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </Button>
                      </div>
                      <h3 className="font-semibold text-lg">{hero.title}</h3>
                      {hero.subtitle && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {hero.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={pageHeroDialogOpen} onOpenChange={setPageHeroDialogOpen}>
        <DialogContent className="max-w-2xl h-[100dvh] sm:h-[90dvh] overflow-hidden p-0">
          <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>
                  Edit{" "}
                  {editingPageHero && PAGE_LABELS[editingPageHero.page_slug]}{" "}
                  Hero
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Update your page hero image and text
                </DialogDescription>
              </DialogHeader>

              {editingPageHero && (
                <div className="space-y-4">
                  <div className="mt-4">
                    <Label>Page</Label>
                    <Input
                      value={PAGE_LABELS[editingPageHero.page_slug]}
                      disabled
                      className="mt-1 bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Page cannot be changed
                    </p>
                  </div>

                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={editingPageHero.title}
                      onChange={(e) =>
                        setEditingPageHero({
                          ...editingPageHero,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g., Our Great Activities"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Subtitle (Optional)</Label>
                    <Textarea
                      value={editingPageHero.subtitle || ""}
                      onChange={(e) =>
                        setEditingPageHero({
                          ...editingPageHero,
                          subtitle: e.target.value,
                        })
                      }
                      placeholder="Brief description for the page..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Hero Image *</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Recommended: 1920x600px, WebP format, 85-90% quality
                    </p>
                    <div className="mt-2">
                      {pageHeroPreview ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                          <Image
                            src={pageHeroPreview}
                            alt="preview"
                            quality={80}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 672px"
                          />
                          <button
                            onClick={() => {
                              setPageHeroPreview(null);
                              setPageHeroImageFile(null);
                            }}
                            className="absolute z-10 top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-forest transition-colors block">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            Click to upload hero image
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WebP up to 5MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={onPageHeroImageSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setPageHeroDialogOpen(false);
                        setEditingPageHero(null);
                        setPageHeroPreview(null);
                        setPageHeroImageFile(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={savePageHero}
                      disabled={savingPageHero || !editingPageHero.title}
                    >
                      {savingPageHero ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Hero"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PageHeroesSection;
