"use client";

import Image from "next/image";
import {
  Edit,
  Plus,
  Trash2,
  Upload,
  X,
  Loader2,
  GripVertical,
} from "lucide-react";
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

import { ActivitiesSectionCMS } from "@/types";

const ActivitiesSection = ({
  activities,
  editingActivity,
  setEditingActivity,
  activityDialogOpen,
  setActivityDialogOpen,
  activityImageFile,
  setActivityImageFile,
  activityPreview,
  setActivityPreview,
  onActivityImageSelect,
  openAddActivity,
  openEditActivity,
  deleteActivity,
  saveActivity,
  savingActivity,
}: ActivitiesSectionCMS) => {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Activities</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage activities and programs shown on the Activities page
              </p>
            </div>
            <Button onClick={openAddActivity} className="gap-2">
              <Plus className="w-4 h-4" /> Add Activity
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No activities yet. Click "Add Activity" to create one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activities.map((activity, index) => (
                  <Card key={activity.id} className="overflow-hidden group">
                    <CardContent className="p-0">
                      <div className="flex gap-4 p-4">
                        {/* Drag Handle */}
                        <div className="flex items-center">
                          <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                        </div>

                        {/* Image Preview */}
                        <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {activity.image_url ? (
                            <Image
                              src={activity.image_url}
                              alt={activity.title}
                              fill
                              className="object-cover"
                              sizes="96px"
                              quality={75}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                              No image
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant={
                                    activity.is_active ? "default" : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {activity.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  #{activity.display_order}
                                </span>
                              </div>
                              <p className="font-medium text-sm truncate">
                                {activity.title}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {activity.description}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditActivity(activity)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteActivity(activity.id)}
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="max-w-2xl h-[100dvh] sm:h-[90dvh] overflow-hidden p-0">
          <div className="custom-scrollbar">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>
                  {editingActivity?.id.startsWith("new-")
                    ? "Add New Activity"
                    : "Edit Activity"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Add or edit your activity details
                </DialogDescription>
              </DialogHeader>

              {editingActivity && (
                <div className="space-y-4">
                  <div className="mt-4">
                    <Label>Title *</Label>
                    <Input
                      value={editingActivity.title}
                      onChange={(e) =>
                        setEditingActivity({
                          ...editingActivity,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g., Weekend Play"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      value={editingActivity.description}
                      onChange={(e) =>
                        setEditingActivity({
                          ...editingActivity,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe this activity in detail..."
                      className="mt-1"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Activity Image</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Recommended: 600x400px, WebP format, 85% quality
                    </p>
                    <div className="mt-2">
                      {activityPreview ? (
                        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                          <Image
                            src={activityPreview}
                            alt="preview"
                            quality={75}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 672px"
                          />
                          <button
                            onClick={() => {
                              setActivityPreview(null);
                              setActivityImageFile(null);
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
                            Click to upload activity image
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WebP up to 5MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={onActivityImageSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Display Order</Label>
                      <Input
                        type="number"
                        min="0"
                        value={editingActivity.display_order}
                        onChange={(e) =>
                          setEditingActivity({
                            ...editingActivity,
                            display_order: parseInt(e.target.value) || 0,
                          })
                        }
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Lower numbers appear first
                      </p>
                    </div>

                    <div>
                      <Label>Status</Label>
                      <select
                        value={
                          editingActivity.is_active ? "active" : "inactive"
                        }
                        onChange={(e) =>
                          setEditingActivity({
                            ...editingActivity,
                            is_active: e.target.value === "active",
                          })
                        }
                        className="block w-full mt-1 p-2 border rounded-lg"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Only active activities show on frontend
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setActivityDialogOpen(false);
                        setEditingActivity(null);
                        setActivityPreview(null);
                        setActivityImageFile(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={saveActivity}
                      disabled={
                        savingActivity ||
                        !editingActivity.title ||
                        !editingActivity.description
                      }
                    >
                      {savingActivity ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Activity"
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

export default ActivitiesSection;
