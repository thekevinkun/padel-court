"use client";

import Image from "next/image";
import { Edit, Plus, Trash2, Upload, X, Loader2, User } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import VersionHistoryDialog from "@/components/dashboard/VersionHistoryDialog";

import { CoachesSectionCMS } from "@/types";

const CoachesSection = ({
  coaches,
  setCoaches,
  editingCoach,
  setEditingCoach,
  coachDialogOpen,
  setCoachDialogOpen,
  coachImageFile,
  coachImagePreview,
  setCoachImagePreview,
  setCoachImageFile,
  onCoachImageSelect,
  openAddCoach,
  openEditCoach,
  deleteCoach,
  saveCoach,
  savingCoach,
  savingCoachesHeader,
  saveCoachesHeader,
  tempCoachesHeader,
  setTempCoachesHeader,
  headerDialogOpen,
  setHeaderDialogOpen,
}: CoachesSectionCMS) => {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl">Coaches Section</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your coaching team profiles
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <VersionHistoryDialog
                sectionType="coaches"
                currentVersion={coaches.version || 1}
              />
              <Button
                variant="outline"
                onClick={() => {
                  setTempCoachesHeader({
                    badge: coaches.badge,
                    heading: coaches.heading,
                    description: coaches.description,
                  });
                  setHeaderDialogOpen(true);
                }}
              >
                <Edit className="w-4 h-4 mr-2" /> Edit Header
              </Button>
              <Button onClick={openAddCoach} className="gap-2">
                <Plus className="w-4 h-4" /> Add Coach
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Header Preview */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg">
            <Badge variant="outline" className="mb-2">
              {coaches.badge}
            </Badge>
            <h3 className="font-semibold text-lg">{coaches.heading}</h3>
            <p className="text-sm text-muted-foreground">
              {coaches.description}
            </p>
          </div>

          {/* Coaches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coaches.coaches.map((coach) => (
              <Card key={coach.id} className="overflow-hidden group">
                <CardContent className="p-0">
                  <div className="relative aspect-[3/4]">
                    {coach.image_url ? (
                      <Image
                        src={coach.image_url}
                        alt={coach.name}
                        fill
                        className="object-cover object-[25%_75%]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <User className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditCoach(coach)}
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteCoach(coach.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm">{coach.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {coach.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Header Dialog */}
      <Dialog open={headerDialogOpen} onOpenChange={setHeaderDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Coaches Header</DialogTitle>
            <DialogDescription className="sr-only">
              Edit section header
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Badge Text</Label>
              <Input
                value={tempCoachesHeader.badge}
                onChange={(e) =>
                  setTempCoachesHeader({
                    ...tempCoachesHeader,
                    badge: e.target.value,
                  })
                }
                placeholder="e.g., Meet the Team"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Heading</Label>
              <Input
                value={tempCoachesHeader.heading}
                onChange={(e) =>
                  setTempCoachesHeader({
                    ...tempCoachesHeader,
                    heading: e.target.value,
                  })
                }
                placeholder="e.g., Our Expert Coaches"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={tempCoachesHeader.description}
                onChange={(e) =>
                  setTempCoachesHeader({
                    ...tempCoachesHeader,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setHeaderDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={saveCoachesHeader}
                disabled={savingCoachesHeader}
              >
                {savingCoachesHeader ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Header"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Coach Dialog */}
      <Dialog open={coachDialogOpen} onOpenChange={setCoachDialogOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-w-2xl h-[100dvh] sm:h-[90dvh] overflow-hidden p-0"
        >
          <div className="custom-scrollbar">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>
                  {editingCoach?.id.startsWith("new-")
                    ? "Add Coach"
                    : "Edit Coach"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Coach details
                </DialogDescription>
              </DialogHeader>

              {editingCoach && (
                <div className="space-y-5 mt-4">
                  {/* Image Upload */}
                  <div>
                    <Label>Coach Photo</Label>
                    <div className="mt-2 relative aspect-[3/4] max-w-[200px] rounded-lg overflow-hidden border-2 border-dashed border-border bg-muted">
                      {coachImagePreview || editingCoach.image_url ? (
                        <>
                          <Image
                            src={coachImagePreview || editingCoach.image_url}
                            alt="Preview"
                            fill
                            className="object-cover object-[25%_75%]"
                          />
                          <button
                            onClick={() => {
                              setCoachImagePreview(null);
                              setCoachImageFile(null);
                              setEditingCoach({
                                ...editingCoach,
                                image_url: "",
                              });
                            }}
                            className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white hover:bg-black/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center h-full gap-2 text-muted-foreground hover:text-foreground transition-colors">
                          <Upload className="w-8 h-8" />
                          <p className="text-xs text-center px-2">
                            Click to upload photo
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WebP up to 5MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={onCoachImageSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    {(coachImagePreview || editingCoach.image_url) && (
                      <label className="mt-2 cursor-pointer inline-flex items-center gap-1 text-xs text-forest hover:underline">
                        <Upload className="w-3 h-3" /> Change photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onCoachImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <Separator />

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name *</Label>
                      <Input
                        value={editingCoach.name}
                        onChange={(e) =>
                          setEditingCoach({
                            ...editingCoach,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g., Carlos Mendez"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Role *</Label>
                      <Input
                        value={editingCoach.role}
                        onChange={(e) =>
                          setEditingCoach({
                            ...editingCoach,
                            role: e.target.value,
                          })
                        }
                        placeholder="e.g., Head Coach"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Experience</Label>
                      <Input
                        value={editingCoach.experience || ""}
                        onChange={(e) =>
                          setEditingCoach({
                            ...editingCoach,
                            experience: e.target.value,
                          })
                        }
                        placeholder="e.g., 8+ years"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Nationality</Label>
                      <Input
                        value={editingCoach.nationality || ""}
                        onChange={(e) =>
                          setEditingCoach({
                            ...editingCoach,
                            nationality: e.target.value,
                          })
                        }
                        placeholder="e.g., Spanish"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Instagram URL</Label>
                    <Input
                      value={editingCoach.instagram_url || ""}
                      onChange={(e) =>
                        setEditingCoach({
                          ...editingCoach,
                          instagram_url: e.target.value,
                        })
                      }
                      placeholder="https://instagram.com/username"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Bio *</Label>
                    <Textarea
                      value={editingCoach.bio}
                      onChange={(e) =>
                        setEditingCoach({
                          ...editingCoach,
                          bio: e.target.value,
                        })
                      }
                      rows={4}
                      placeholder="Coach's background and coaching philosophy..."
                      className="mt-1"
                    />
                  </div>

                  <Separator />

                  {/* Specialties */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Specialties</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditingCoach({
                            ...editingCoach,
                            specialties: [
                              ...(editingCoach.specialties || []),
                              "",
                            ],
                          })
                        }
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(editingCoach.specialties || []).map((s, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={s}
                            onChange={(e) => {
                              const updated = [...editingCoach.specialties];
                              updated[i] = e.target.value;
                              setEditingCoach({
                                ...editingCoach,
                                specialties: updated,
                              });
                            }}
                            placeholder="e.g., Match Strategy"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              const updated = editingCoach.specialties.filter(
                                (_, idx) => idx !== i,
                              );
                              setEditingCoach({
                                ...editingCoach,
                                specialties: updated,
                              });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Certifications</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditingCoach({
                            ...editingCoach,
                            certifications: [
                              ...(editingCoach.certifications || []),
                              "",
                            ],
                          })
                        }
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(editingCoach.certifications || []).map((c, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={c}
                            onChange={(e) => {
                              const updated = [...editingCoach.certifications];
                              updated[i] = e.target.value;
                              setEditingCoach({
                                ...editingCoach,
                                certifications: updated,
                              });
                            }}
                            placeholder="e.g., WPT Certified Level 3"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              const updated =
                                editingCoach.certifications.filter(
                                  (_, idx) => idx !== i,
                                );
                              setEditingCoach({
                                ...editingCoach,
                                certifications: updated,
                              });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setCoachDialogOpen(false);
                        setEditingCoach(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={saveCoach}
                      disabled={
                        savingCoach || !editingCoach.name || !editingCoach.bio
                      }
                    >
                      {savingCoach ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                          Saving...
                        </>
                      ) : (
                        "Save Coach"
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

export default CoachesSection;
