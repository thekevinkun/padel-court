"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Loader2,
  GripVertical,
} from "lucide-react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import { Court } from "@/types";
import {
  uploadImage,
  validateImageFile,
  deleteImage,
  extractFilePathFromUrl,
} from "@/lib/upload";
import { supabase } from "@/lib/supabase/client";

// Sortable Feature Item Component
function SortableFeatureItem({
  id,
  feature,
  onRemove,
}: {
  id: string;
  feature: string;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-muted rounded group"
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>
      <span className="text-sm flex-1">{feature}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

const CourtsPageClient = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    available: true,
    features: [] as string[],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Feature input state
  const [featureInput, setFeatureInput] = useState("");

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      const { data, error } = await supabase
        .from("courts")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true }); // Fallback for same display_order

      if (!error && data) {
        setCourts(data);
      }
    } catch (error) {
      console.error("Error fetching courts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file before setting
    const validation = validateImageFile(file, 5); // Max 5MB
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Add feature to list
  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      });
      setFeatureInput("");
    }
  };

  // Remove feature from list
  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  // Handle drag end - reorder features
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = formData.features.findIndex(
        (_, i) => `feature-${i}` === active.id
      );
      const newIndex = formData.features.findIndex(
        (_, i) => `feature-${i}` === over.id
      );

      setFormData({
        ...formData,
        features: arrayMove(formData.features, oldIndex, newIndex),
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Court name is required");
      return;
    }

    setUploading(true);
    try {
      let imageUrl = editingCourt?.image_url || null;

      // Upload new image if selected
      if (imageFile) {
        // Delete old image if updating and old image exists
        if (editingCourt?.image_url) {
          const oldFilePath = extractFilePathFromUrl(
            editingCourt.image_url,
            "courts"
          );
          if (oldFilePath) {
            await deleteImage("courts", oldFilePath);
            console.log("🗑️ Old court image deleted");
          }
        }

        // Upload new image to 'courts' bucket
        const uploadedUrl = await uploadImage("courts", imageFile);
        if (!uploadedUrl) {
          throw new Error("Failed to upload image. Please try again.");
        }
        imageUrl = uploadedUrl;
      }

      if (editingCourt) {
        // Update existing court
        const { error } = await supabase
          .from("courts")
          .update({
            name: formData.name,
            description: formData.description,
            image_url: imageUrl,
            available: formData.available,
            features: formData.features,
          })
          .eq("id", editingCourt.id);

        if (error) {
          console.error("Update error:", error);
          throw error;
        }
      } else {
        // Create new court - set display_order as highest + 1
        const maxOrder =
          courts.length > 0
            ? Math.max(...courts.map((c) => c.display_order || 0))
            : 0;

        const { error } = await supabase.from("courts").insert({
          name: formData.name,
          description: formData.description,
          image_url: imageUrl,
          available: formData.available,
          features: formData.features,
          display_order: maxOrder + 1,
        });

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
      }

      // Refresh courts list
      await fetchCourts();

      // Close dialog and reset form
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving court:", error);
      alert(
        `Error saving court: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (court: Court) => {
    setEditingCourt(court);
    setFormData({
      name: court.name,
      description: court.description,
      available: court.available,
      features: court.features || [],
    });
    setImagePreview(court.image_url);
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this court?")) {
      return;
    }

    try {
      // Find the court to get its image URL
      const courtToDelete = courts.find((c) => c.id === id);

      // Delete court image from storage if exists
      if (courtToDelete?.image_url) {
        const filePath = extractFilePathFromUrl(
          courtToDelete.image_url,
          "courts"
        );
        if (filePath) {
          await deleteImage("courts", filePath);
          console.log("🗑️ Court image deleted from storage");
        }
      }

      // Delete court from database
      const { error } = await supabase.from("courts").delete().eq("id", id);
      if (error) throw error;

      await fetchCourts();
    } catch (error) {
      console.error("Error deleting court:", error);
      alert("Error deleting court");
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCourt(null);
    setFormData({ name: "", description: "", available: true, features: [] });
    setImageFile(null);
    setImagePreview(null);
    setFeatureInput("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Courts ({courts.length})</h2>
          <p className="text-sm text-muted-foreground">
            Manage your padel courts
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Court
        </Button>
      </div>

      {/* Courts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courts.map((court) => (
          <motion.div
            key={court.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
              {/* Court Image */}
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                {court.image_url ? (
                  /* GRID OPTIMIZATION: 33vw on desktop */
                  <Image
                    src={court.image_url}
                    alt={court.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                {!court.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <span className="text-white font-semibold">
                      Maintenance
                    </span>
                  </div>
                )}
              </div>

              {/* Court Info */}
              <CardContent className="flex-1 flex flex-col p-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{court.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {court.description}
                  </p>

                  {/* Features Preview */}
                  {court.features && court.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {court.features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {court.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{court.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mt-4 mb-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      court.available
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {court.available ? "Available" : "Maintenance"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(court)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(court.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {courts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No courts yet</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Court
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Court Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl h-[100dvh] sm:h-[90dvh] overflow-hidden p-0">
          <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>
                  {editingCourt ? "Edit Court" : "Add New Court"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Add or Edit your court
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Image Upload */}
                <div className="mt-4 mb-10">
                  <Label>Court Image</Label>
                  <div className="mt-10">
                    {imagePreview ? (
                      /* DIALOG PREVIEW: Max-w-4xl (approx 896px) */
                      <div className="relative w-full aspect-video">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 768px) 100vw, 896px"
                        />
                        <button
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                          }}
                          className="absolute z-10 top-2 right-2 bg-red-500 text-white p-1 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-forest transition-colors">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload</p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 5MB
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Court Name */}
                <div>
                  <Label htmlFor="name">Court Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Court 1 - Paradise"
                    className="mt-1"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe your court..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Features Management with Drag & Drop */}
                <div>
                  <Label>Court Features</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Add features and drag to reorder (top features show first)
                  </p>

                  {/* Add Feature Input */}
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      placeholder="e.g., Professional-grade surface"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddFeature}
                      disabled={!featureInput.trim()}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Sortable Features List */}
                  {formData.features.length > 0 && (
                    <div className="border rounded-lg p-3">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={formData.features.map(
                            (_, i) => `feature-${i}`
                          )}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {formData.features.map((feature, index) => (
                              <SortableFeatureItem
                                key={`feature-${index}`}
                                id={`feature-${index}`}
                                feature={feature}
                                onRemove={() => handleRemoveFeature(index)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  )}
                </div>

                {/* Available Toggle */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        available: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="available" className="cursor-pointer">
                    Court is available for booking
                  </Label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCloseDialog}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>{editingCourt ? "Update" : "Add"} Court</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourtsPageClient;
