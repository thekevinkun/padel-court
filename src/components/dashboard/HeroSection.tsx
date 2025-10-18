"use client";

import { Edit, Upload, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { HeroSectionCMS } from "@/types";

const HeroSection = ({
  hero,
  setHero,
  heroDialogOpen,
  setHeroDialogOpen,
  heroPreview,
  setHeroPreview,
  setHeroImageFile,
  onHeroImageSelect,
  saveHero,
  savingHero,
}: HeroSectionCMS) => {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Hero Section</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Main landing section with hero image, title, and stats
              </p>
            </div>
            <Button onClick={() => setHeroDialogOpen(true)} className="gap-2">
              <Edit className="w-4 h-4" /> Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {hero.image_url ? (
                <img
                  src={hero.image_url}
                  alt="hero"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <Badge variant="outline">{hero.badge}</Badge>
              <h3 className="font-semibold text-lg">{hero.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {hero.subtitle}
              </p>
              <div className="flex gap-6 pt-2">
                {hero.stats.map((s: any, i: number) => (
                  <div key={i}>
                    <div className="text-2xl font-bold text-forest">
                      {s.number}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hero Dialog */}
      <Dialog open={heroDialogOpen} onOpenChange={setHeroDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Hero Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Badge</Label>
              <Input
                value={hero.badge}
                onChange={(e) => setHero({ ...hero, badge: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={hero.title}
                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                value={hero.subtitle}
                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label>Hero Image</Label>
              <div className="mt-2">
                {heroPreview ? (
                  <div className="relative">
                    <img
                      src={heroPreview}
                      alt="preview"
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setHeroPreview(null);
                        setHeroImageFile(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-forest transition-colors block">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 5MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onHeroImageSelect}
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
                onClick={() => setHeroDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={saveHero}
                disabled={savingHero}
              >
                {savingHero ? (
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
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeroSection;
