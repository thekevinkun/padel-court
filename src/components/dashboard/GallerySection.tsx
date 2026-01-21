"use client";

import Image from "next/image";
import {
  Edit,
  Plus,
  Trash2,
  Upload,
  X,
  Loader2,
  ImageIcon,
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
  DialogDescription,
} from "@/components/ui/dialog";
import VersionHistoryDialog from "@/components/dashboard/VersionHistoryDialog";
import { GallerySectionCMS } from "@/types";

const GallerySection = ({
  gallery,
  setGallery,
  galleryDialogOpen,
  setGalleryDialogOpen,
  imageDialogOpen,
  setImageDialogOpen,
  noteDialogOpen,
  setNoteDialogOpen,
  editingImage,
  setEditingImage,
  imageFile,
  setImageFile,
  imagePreview,
  setImagePreview,
  onImageSelect,
  openAddImage,
  openEditImage,
  deleteImage,
  saveImage,
  saveNote,
  savingGallery,
}: GallerySectionCMS) => {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Gallery Section</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Showcase your facilities with stunning images and a motivational
                note
              </p>
            </div>
            <div className="flex items-center gap-2">
              <VersionHistoryDialog
                sectionType="gallery"
                currentVersion={gallery.version || 1}
              />
              <Button
                onClick={() => setGalleryDialogOpen(true)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" /> Edit Section
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Section Header Info */}
            <div>
              <Badge variant="outline" className="mb-2">
                {gallery.badge}
              </Badge>
              <h3 className="font-semibold text-lg">{gallery.heading}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {gallery.description}
              </p>
            </div>

            {/* Note Card Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  Note Card (Black Background)
                </h4>
                <Button
                  onClick={() => setNoteDialogOpen(true)}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Note
                </Button>
              </div>
              <Card className="bg-gradient-to-br from-black via-gray-900 to-black border-0">
                <CardContent className="p-6 text-center">
                  <h4 className="text-xl font-bold text-primary mb-3">
                    {gallery.note.title}
                  </h4>
                  <p className="text-white/80 text-sm">
                    {gallery.note.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gallery Images */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-forest" />
                  Gallery Images ({gallery.images.length})
                </h4>
                <Button
                  onClick={openAddImage}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Image
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.images.map((image, index) => (
                  <Card key={image.id} className="overflow-hidden group">
                    <CardContent className="p-0">
                      {/* OPTIMIZATION: GRID IMAGES */}
                      <div className="relative aspect-square">
                        <Image
                          src={image.url}
                          alt={image.alt}
                          quality={75}
                          fill
                          className="object-cover"
                          // Logic: Mobile (2 cols = 50vw), Tablet (3 cols = 33vw), Desktop (4 cols = 25vw)
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 z-10 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openEditImage(image)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteImage(image.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                        {/* Image number badge */}
                        <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-medium truncate">
                          {image.alt}
                        </p>
                        {image.caption && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {image.caption}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Section Dialog */}
      <Dialog open={galleryDialogOpen} onOpenChange={setGalleryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Gallery Section</DialogTitle>
            <DialogDescription className="sr-only">
              Choose your section to update
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Badge</Label>
              <Input
                value={gallery.badge}
                onChange={(e) =>
                  setGallery({ ...gallery, badge: e.target.value })
                }
                placeholder="e.g., Gallery"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Heading</Label>
              <Input
                value={gallery.heading}
                onChange={(e) =>
                  setGallery({ ...gallery, heading: e.target.value })
                }
                placeholder="e.g., Captured Moments"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={gallery.description}
                onChange={(e) =>
                  setGallery({ ...gallery, description: e.target.value })
                }
                placeholder="Section description..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setGalleryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  saveNote();
                  setGalleryDialogOpen(false);
                }}
                disabled={savingGallery}
              >
                {savingGallery ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Note Card Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Note Card</DialogTitle>
            <DialogDescription>
              This black card appears in the gallery grid
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Note Title *</Label>
              <Input
                value={gallery.note.title}
                onChange={(e) =>
                  setGallery({
                    ...gallery,
                    note: { ...gallery.note, title: e.target.value },
                  })
                }
                placeholder="e.g., Every Game Tells a Story"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Note Description *</Label>
              <Textarea
                value={gallery.note.description}
                onChange={(e) =>
                  setGallery({
                    ...gallery,
                    note: { ...gallery.note, description: e.target.value },
                  })
                }
                placeholder="Motivational text for the note card..."
                className="mt-1"
                rows={4}
              />
            </div>

            {/* Preview */}
            <div>
              <Label className="mb-2 block">Preview</Label>
              <Card className="bg-gradient-to-br from-black via-gray-900 to-black border-0">
                <CardContent className="p-6 text-center">
                  <h4 className="text-xl font-bold text-primary mb-3">
                    {gallery.note.title || "Note Title"}
                  </h4>
                  <p className="text-white/80 text-sm">
                    {gallery.note.description || "Note description..."}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setNoteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={saveNote}
                disabled={
                  savingGallery ||
                  !gallery.note.title ||
                  !gallery.note.description
                }
              >
                {savingGallery ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Note"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingImage?.id.startsWith("new-")
                ? "Add Gallery Image"
                : "Edit Gallery Image"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Find your image for update gallery
            </DialogDescription>
          </DialogHeader>
          {editingImage && (
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <Label>Gallery Image *</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    /* OPTIMIZATION: PREVIEW IMAGE 
                       - Moved 'aspect-video' to parent div
                       - Capped sizes at 680px (Dialog width)
                    */
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="preview"
                        quality={75}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 680px"
                      />
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
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
                        Click to upload image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WebP up to 5MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Alt Text */}
              <div>
                <Label htmlFor="alt">Alt Text (Image Description) *</Label>
                <Input
                  id="alt"
                  value={editingImage.alt}
                  onChange={(e) =>
                    setEditingImage({
                      ...editingImage,
                      alt: e.target.value,
                    })
                  }
                  placeholder="e.g., Intense padel match on Court 1"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Describe what's in the image (for accessibility and SEO)
                </p>
              </div>

              {/* Caption */}
              <div>
                <Label htmlFor="caption">Caption (Optional)</Label>
                <Textarea
                  id="caption"
                  value={editingImage.caption || ""}
                  onChange={(e) =>
                    setEditingImage({
                      ...editingImage,
                      caption: e.target.value,
                    })
                  }
                  placeholder="e.g., Professional tournament action on our premium courts"
                  className="mt-1"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Shows on hover and in lightbox view
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setImageDialogOpen(false);
                    setEditingImage(null);
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={saveImage}
                  disabled={
                    savingGallery ||
                    !editingImage.alt ||
                    (!imageFile && !editingImage.url)
                  }
                >
                  {savingGallery ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Image"
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

export default GallerySection;
