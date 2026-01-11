"use client";

import Image from "next/image";
import {
  Edit,
  Plus,
  Trash2,
  Upload,
  X,
  Loader2,
  Star,
  Video,
  MessageSquare,
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
import { TestimonialsSectionCMS } from "@/types";

const TestimonialsSection = ({
  testimonials,
  setTestimonials,
  testimonialsDialogOpen,
  setTestimonialsDialogOpen,
  videoPreview,
  setVideoPreview,
  backgroundPreview,
  setBackgroundPreview,
  setVideoFile,
  setBackgroundFile,
  onVideoSelect,
  onBackgroundSelect,
  saveTestimonials,
  savingTestimonials,
  testimonialDialogOpen,
  setTestimonialDialogOpen,
  editingTestimonial,
  setEditingTestimonial,
  openAddTestimonial,
  openEditTestimonial,
  deleteTestimonial,
  saveTestimonial,
  savingTestimonial,
}: TestimonialsSectionCMS) => {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Testimonials Section</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Video showcase and customer testimonials slider
              </p>
            </div>
            <div className="flex items-center gap-2">
              <VersionHistoryDialog
                sectionType="testimonials"
                currentVersion={testimonials.version || 1}
              />
              <Button
                onClick={() => setTestimonialsDialogOpen(true)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" /> Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Header Info */}
            <div>
              <Badge variant="outline" className="mb-2">
                {testimonials.badge}
              </Badge>
              <h3 className="font-semibold text-lg">{testimonials.heading}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {testimonials.description}
              </p>
            </div>

            {/* Video Preview */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Video className="w-4 h-4 text-forest" />
                Video/Placeholder
              </h4>
              {/* Added 'relative' for fill */}
              <div className="relative w-full max-w-md aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {testimonials.videoUrl ? (
                  testimonials.videoUrl.endsWith(".mp4") ||
                  testimonials.videoUrl.endsWith(".webm") ||
                  testimonials.videoUrl.endsWith(".ogg") ? (
                    <video
                      src={testimonials.videoUrl}
                      className="w-full h-full object-cover"
                      controls
                      muted
                    />
                  ) : (
                    /* DASHBOARD VIDEO THUMBNAIL */
                    <Image
                      src={testimonials.videoUrl}
                      alt="Video preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 448px"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    No video/thumbnail
                  </div>
                )}
              </div>
            </div>

            {/* Background Image Preview */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-forest" />
                Background Image (with dark overlay)
              </h4>
              <div className="relative w-full max-w-md aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {testimonials.backgroundImage ? (
                  <>
                    {/* DASHBOARD BACKGROUND PREVIEW */}
                    <Image
                      src={testimonials.backgroundImage}
                      alt="Background preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 448px"
                    />
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                      <p className="text-white text-xs">
                        Dark overlay will be applied
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    No background image
                  </div>
                )}
              </div>
            </div>

            {/* Testimonials List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-forest" />
                  Testimonials ({testimonials.testimonials.length})
                </h4>
                <Button
                  onClick={openAddTestimonial}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Testimonial
                </Button>
              </div>

              <div className="space-y-3">
                {testimonials.testimonials.map((testimonial, index) => (
                  <Card key={testimonial.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar or Initial */}
                        {/* AVATAR OPTIMIZATION (48px) */}
                        <div className="relative w-12 h-12 flex-shrink-0">
                          {testimonial.avatar ? (
                            <Image
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              fill
                              className="rounded-full object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-forest/10 flex items-center justify-center">
                              <span className="text-forest font-bold">
                                {testimonial.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="font-medium">{testimonial.name}</p>
                              {testimonial.role && (
                                <p className="text-xs text-muted-foreground">
                                  {testimonial.role}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < testimonial.rating
                                      ? "fill-primary text-primary"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            "{testimonial.comment}"
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditTestimonial(testimonial)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteTestimonial(testimonial.id)}
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Section Edit Dialog */}
      <Dialog
        open={testimonialsDialogOpen}
        onOpenChange={setTestimonialsDialogOpen}
      >
        <DialogContent className="max-w-2xl h-[100dvh] sm:h-[90dvh] overflow-hidden p-0">
          <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent">
            <div className="p-6">
          <DialogHeader>
            <DialogTitle>Edit Testimonials Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="mt-4 mb-10">
              <Label>Badge</Label>
              <Input
                value={testimonials.badge}
                onChange={(e) =>
                  setTestimonials({ ...testimonials, badge: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Heading</Label>
              <Input
                value={testimonials.heading}
                onChange={(e) =>
                  setTestimonials({ ...testimonials, heading: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={testimonials.description}
                onChange={(e) =>
                  setTestimonials({
                    ...testimonials,
                    description: e.target.value,
                  })
                }
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Video Upload */}
            <div>
              <Label>Video/Placeholder (shown on desktop only)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Upload a video or image for the floating showcase box (hidden on
                mobile)
              </p>
              <div className="mt-2">
                {videoPreview ? (
                  <div className="relative w-full aspect-video">
                    {videoPreview.startsWith("data:video") ||
                    videoPreview.endsWith(".mp4") ||
                    videoPreview.endsWith(".webm") ||
                    videoPreview.endsWith(".ogg") ? (
                      <video
                        src={videoPreview}
                        className="w-full h-full object-cover rounded-lg"
                        controls
                        muted
                      />
                    ) : (
                      /* DIALOG VIDEO THUMBNAIL */
                      <Image
                        src={videoPreview}
                        alt="preview"
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, 672px"
                      />
                    )}
                    <button
                      onClick={() => {
                        setVideoPreview(null);
                        setVideoFile(null);
                      }}
                      className="absolute z-10 top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-forest transition-colors block">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Upload Video/Image</p>
                    <p className="text-xs text-muted-foreground">
                      16:9 aspect ratio recommended (MP4, WebM for video)
                    </p>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={onVideoSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Background Image Upload */}
            <div>
              <Label>Background Image (with dark overlay)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                This image will be shown behind testimonials with 70% dark
                overlay
              </p>
              <div className="mt-2">
                {backgroundPreview ? (
                  /* DIALOG BACKGROUND PREVIEW */
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={backgroundPreview}
                      alt="background preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 672px"
                    />
                    <div className="absolute inset-0 bg-black/70" />
                    <button
                      onClick={() => {
                        setBackgroundPreview(null);
                        setBackgroundFile(null);
                      }}
                      className="absolute z-10 top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-forest transition-colors block">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Upload Background</p>
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

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setTestimonialsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={saveTestimonials}
                disabled={savingTestimonials}
              >
                {savingTestimonials ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Section"
                )}
              </Button>
            </div>
          </div>
          </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Testimonial Item Dialog (No changes needed for Image, only text inputs here usually) */}
      <Dialog
        open={testimonialDialogOpen}
        onOpenChange={setTestimonialDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial?.id.startsWith("new-")
                ? "Add Testimonial"
                : "Edit Testimonial"}
            </DialogTitle>
          </DialogHeader>
          {editingTestimonial && (
            <div className="space-y-4">
              <div>
                <Label>Customer Name *</Label>
                <Input
                  value={editingTestimonial.name}
                  onChange={(e) =>
                    setEditingTestimonial({
                      ...editingTestimonial,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g., John Doe"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Role/Title (Optional)</Label>
                <Input
                  value={editingTestimonial.role || ""}
                  onChange={(e) =>
                    setEditingTestimonial({
                      ...editingTestimonial,
                      role: e.target.value,
                    })
                  }
                  placeholder="e.g., Regular Player"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Rating (1-5 Stars) *</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        setEditingTestimonial({
                          ...editingTestimonial,
                          rating,
                        })
                      }
                      className="p-2 rounded hover:bg-muted transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          rating <= editingTestimonial.rating
                            ? "fill-primary text-primary"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Testimonial Comment *</Label>
                <Textarea
                  value={editingTestimonial.comment}
                  onChange={(e) =>
                    setEditingTestimonial({
                      ...editingTestimonial,
                      comment: e.target.value,
                    })
                  }
                  placeholder="Share your experience..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setTestimonialDialogOpen(false);
                    setEditingTestimonial(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={saveTestimonial}
                  disabled={
                    savingTestimonial ||
                    !editingTestimonial.name ||
                    !editingTestimonial.comment
                  }
                >
                  {savingTestimonial ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Testimonial"
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

export default TestimonialsSection;
