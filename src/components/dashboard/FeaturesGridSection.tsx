"use client";

import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Loader2,
  Users,
  Clock,
  Sparkles,
  DollarSign,
  Trophy,
  Zap,
} from "lucide-react";
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
} from "@/components/ui/dialog";

import VersionHistoryDialog from "@/components/dashboard/VersionHistoryDialog";
import { FeaturesGridSectionCMS } from "@/types";

const FeaturesGridSection = ({
  features,
  openCreateFeature,
  openEditFeature,
  deleteFeature,
  editingFeature,
  setEditingFeature,
  featurePreview,
  setFeaturePreview,
  setFeatureFile,
  onFeatureImageSelect,
  featuresDialogOpen,
  setFeaturesDialogOpen,
  saveFeature,
  savingFeatures,
}: FeaturesGridSectionCMS) => {
  const IconFromName = ({ name }: { name: string }) => {
    const icons: any = {
      Users: Users,
      Clock: Clock,
      Sparkles: Sparkles,
      DollarSign: DollarSign,
      Trophy: Trophy,
      Zap: Zap,
      Target: () => (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    };
    const Icon = icons[name] || Sparkles;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Features Grid</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Alternating grid of 3 images and 3 text cards (6 total)
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {features.items.filter((f) => f.type === "image").length} Images
              </Badge>
              <Badge variant="outline" className="text-xs">
                {features.items.filter((f) => f.type === "text").length} Text
                Cards
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Feature Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.items.map((f, idx) => (
                <Card key={f.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4 p-4">
                      {/* Preview */}
                      <div className="flex-shrink-0">
                        {f.type === "image" ? (
                          /* THUMBNAIL OPTIMIZATION */
                          /* Added 'relative' to parent. Fixed size w-24 (96px). */
                          <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                            {f.src ? (
                              <Image
                                src={f.src}
                                alt={f.alt || "feature"}
                                fill
                                className="object-cover"
                                sizes="96px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                No image
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center">
                            <IconFromName name={f.icon} />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <Badge variant="secondary" className="text-xs mb-1">
                              {f.type === "image" ? "Image Card" : "Text Card"}
                            </Badge>
                            <p className="font-medium text-sm">
                              {f.type === "image"
                                ? f.alt || "Untitled Image"
                                : f.title || "Untitled Text"}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            #{idx + 1}
                          </span>
                        </div>

                        {f.type === "text" && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {f.description}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <div className="flex items-center gap-2">
                            <VersionHistoryDialog
                              sectionType="features"
                              currentVersion={features.version || 1}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => openEditFeature(f)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </div>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteFeature(f.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Feature Button */}
            {features.items.length < 6 && (
              <Button
                onClick={openCreateFeature}
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Feature Card ({features.items.length}/6)
              </Button>
            )}

            {features.items.length >= 6 && (
              <div className="text-center py-2">
                <p className="text-xs text-muted-foreground">
                  Maximum 6 features reached. Delete one to add more.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={featuresDialogOpen} onOpenChange={setFeaturesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFeature &&
              features.items.find((f) => f.id === editingFeature.id)
                ? "Edit Feature"
                : "Add Feature"}
            </DialogTitle>
          </DialogHeader>
          {editingFeature && (
            <div className="space-y-4">
              <div>
                <Label>Feature Type</Label>
                <select
                  value={editingFeature.type}
                  onChange={(e) =>
                    setEditingFeature((prev: any) => ({
                      ...prev,
                      type: e.target.value as "image" | "text",
                    }))
                  }
                  className="block w-full mt-1 p-2 border rounded-lg"
                >
                  <option value="image">Image Card</option>
                  <option value="text">Text Card</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {editingFeature.type === "image"
                    ? "Full-size image card"
                    : "Text card with icon, title, and description"}
                </p>
              </div>

              {editingFeature.type === "image" ? (
                <>
                  <div>
                    <Label>Feature Image</Label>
                    <div className="mt-2">
                      {featurePreview ? (
                        /* DIALOG SQUARE PREVIEW */
                        /* Moved aspect-square to parent div */
                        <div className="relative w-full aspect-square">
                          <Image
                            src={featurePreview}
                            alt="preview"
                            fill
                            className="object-cover rounded-lg"
                            sizes="(max-width: 768px) 100vw, 672px"
                          />
                          <button
                            onClick={() => {
                              setFeaturePreview(null);
                              setFeatureFile(null);
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
                            Upload Feature Image
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Square image recommended (1:1 ratio)
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={onFeatureImageSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Alt Text (Image Description)</Label>
                    <Input
                      value={editingFeature.alt}
                      onChange={(e) =>
                        setEditingFeature({
                          ...editingFeature,
                          alt: e.target.value,
                        })
                      }
                      placeholder="e.g., Professional padel court at Batu Alam Permai"
                      className="mt-1"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Background Image</Label>
                    <div className="mt-2">
                      {featurePreview ? (
                        /* DIALOG BANNER PREVIEW */
                        /* Moved h-32 to parent div */
                        <div className="relative w-full h-32">
                          <Image
                            src={featurePreview}
                            alt="preview"
                            fill
                            className="object-cover rounded-lg opacity-50"
                            sizes="(max-width: 768px) 100vw, 672px"
                          />
                          <button
                            onClick={() => {
                              setFeaturePreview(null);
                              setFeatureFile(null);
                            }}
                            className="absolute z-10 top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-forest transition-colors block">
                          <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-sm">
                            Upload Background (Optional)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Will be overlayed with primary color
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={onFeatureImageSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Icon</Label>
                    <select
                      value={editingFeature.icon}
                      onChange={(e) =>
                        setEditingFeature({
                          ...editingFeature,
                          icon: e.target.value,
                        })
                      }
                      className="block w-full mt-1 p-2 border rounded-lg"
                    >
                      <option value="Trophy">
                        🏆 Trophy (Tournaments/Competition)
                      </option>
                      <option value="Zap">⚡ Zap (Energy/Speed)</option>
                      <option value="Target">
                        🎯 Target (Precision/Goals)
                      </option>
                      <option value="Users">👥 Users (Community/Team)</option>
                      <option value="Clock">🕐 Clock (Time/Schedule)</option>
                      <option value="Sparkles">
                        ✨ Sparkles (Premium/Quality)
                      </option>
                    </select>
                    <div className="mt-2 flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">
                        Preview:
                      </span>
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <IconFromName name={editingFeature.icon} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={editingFeature.title}
                      onChange={(e) =>
                        setEditingFeature({
                          ...editingFeature,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g., Competitive Tournaments & Events"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editingFeature.description}
                      onChange={(e) =>
                        setEditingFeature({
                          ...editingFeature,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe this feature in detail..."
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setFeaturesDialogOpen(false);
                    setEditingFeature(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={saveFeature}
                  disabled={savingFeatures}
                >
                  {savingFeatures ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Feature"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeaturesGridSection;
