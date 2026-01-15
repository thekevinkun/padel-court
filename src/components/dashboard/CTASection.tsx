import React from "react";
import Image from "next/image";
import { Edit, Upload, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import VersionHistoryDialog from "@/components/dashboard/VersionHistoryDialog";

import { CTASectionCMS } from "@/types";

const CTASection = ({
  cta,
  setCta,
  ctaDialogOpen,
  setCtaDialogOpen,
  backgroundPreview,
  setBackgroundPreview,
  setBackgroundFile,
  onBackgroundSelect,
  saveCta,
  savingCta,
}: CTASectionCMS) => {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">CTA Section</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Call-to-action section with parallax background before footer
              </p>
            </div>
            <div className="flex items-center gap-2">
              <VersionHistoryDialog
                sectionType="cta"
                currentVersion={cta.version || 1}
              />
              <Button onClick={() => setCtaDialogOpen(true)} className="gap-2">
                <Edit className="w-4 h-4" /> Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Background Preview */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Background Image
              </Label>
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {cta.backgroundImage ? (
                  <>
                    {/* DASHBOARD PREVIEW OPTIMIZATION */}
                    <Image
                      src={cta.backgroundImage}
                      alt="CTA background"
                      quality={75}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {/* Dark overlay preview */}
                    <div
                      className="absolute inset-0 bg-transparent bg-[linear-gradient(130deg,#000000_49%,#0D1301D1_34%)] 
                        opacity-70 transition-[background,border-radius,opacity] z-10"
                    />
                    {/* Text overlay preview */}
                    <div className="absolute inset-0 flex items-center p-8 z-20">
                      <div className="max-w-2xl">
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                          {cta.title}
                        </h3>
                        <p className="max-w-lg text-white/90 text-sm md:text-base line-clamp-2">
                          {cta.subtitle}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No background image
                  </div>
                )}
              </div>
            </div>

            {/* Content Preview */}
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-muted-foreground">Title</Label>
                <p className="font-semibold text-lg">{cta.title}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Subtitle
                </Label>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {cta.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Button Text
                  </Label>
                  <Badge className="mt-1">{cta.buttonText}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Button Link
                  </Label>
                  <p className="text-sm text-blue-600 mt-1">{cta.buttonLink}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={ctaDialogOpen} onOpenChange={setCtaDialogOpen}>
        <DialogContent className="max-w-2xl h-[100dvh] sm:h-[90dvh] overflow-hidden p-0">
          <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>Edit CTA Section</DialogTitle>
                <DialogDescription className="sr-only">
                  Choose your assets for CTA Section
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Background Image Upload */}
                <div className="mt-4 mb-10">
                  <Label>Background Image</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    This image will show with parallax effect and dark overlay
                  </p>
                  <div className="mt-2">
                    {backgroundPreview ? (
                      /* DIALOG PREVIEW OPTIMIZATION 
                     - Moved 'aspect-video' to parent div
                     - Applied max size of 672px
                  */
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={backgroundPreview}
                          alt="preview"
                          quality={75}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 672px"
                        />
                        {/* Show overlay in preview */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10" />
                        <button
                          onClick={() => {
                            setBackgroundPreview(null);
                            setBackgroundFile(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 z-20"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-forest transition-colors block">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          Upload Background Image
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Court or facility image recommended
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onBackgroundSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={cta.title}
                    onChange={(e) => setCta({ ...cta, title: e.target.value })}
                    placeholder="e.g., Ready to Experience Premium Padel?"
                    className="mt-1"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <Label htmlFor="subtitle">Subtitle *</Label>
                  <Textarea
                    id="subtitle"
                    value={cta.subtitle}
                    onChange={(e) =>
                      setCta({ ...cta, subtitle: e.target.value })
                    }
                    placeholder="Compelling description to encourage action..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Button Text */}
                <div>
                  <Label htmlFor="buttonText">Button Text *</Label>
                  <Input
                    id="buttonText"
                    value={cta.buttonText}
                    onChange={(e) =>
                      setCta({ ...cta, buttonText: e.target.value })
                    }
                    placeholder="e.g., Book Your Court Now"
                    className="mt-1"
                  />
                </div>

                {/* Button Link */}
                <div>
                  <Label htmlFor="buttonLink">Button Link *</Label>
                  <Input
                    id="buttonLink"
                    value={cta.buttonLink}
                    onChange={(e) =>
                      setCta({ ...cta, buttonLink: e.target.value })
                    }
                    placeholder="e.g., #booking or /pricing"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use #booking for booking dialog, or /page for internal links
                  </p>
                </div>

                {/* Preview Box */}
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Preview
                  </Label>
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg">{cta.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {cta.subtitle}
                    </p>
                    <Badge className="mt-2">{cta.buttonText}</Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCtaDialogOpen(false)}
                    disabled={savingCta}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={saveCta}
                    disabled={
                      savingCta ||
                      !cta.title ||
                      !cta.subtitle ||
                      !cta.buttonText ||
                      !cta.buttonLink
                    }
                  >
                    {savingCta ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save CTA Section"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CTASection;
