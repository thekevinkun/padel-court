"use client";

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
} from "@/components/ui/dialog";
import VersionHistoryDialog from "@/components/dashboard/VersionHistoryDialog";

import { WelcomeSectionCMS } from "@/types";

const WelcomeSection = ({
  welcome,
  setWelcome,
  welcomeDialogOpen,
  setWelcomeDialogOpen,
  welcomePreviews,
  tempWelcomePreviews,
  setTempWelcomePreviews,
  welcomeFiles,
  setWelcomeFiles,
  onWelcomeImageSelect,
  saveWelcome,
  savingWelcome,
  openWelcomeDialog,
}: WelcomeSectionCMS) => {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Welcome Section</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Image collage with welcome message and features
              </p>
            </div>
            <div className="flex items-center gap-2">
              <VersionHistoryDialog
                sectionType="welcome"
                currentVersion={welcome.version || 1}
              />
              <Button onClick={openWelcomeDialog} className="gap-2">
                <Edit className="w-4 h-4" /> Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* DASHBOARD THUMBNAILS (4 Columns) */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {welcomePreviews.map((p, idx) => (
              <div
                key={idx}
                // Added 'relative' so 'fill' works correctly
                className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden"
              >
                {p ? (
                  <Image
                    src={p}
                    alt={`welcome-${idx}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 25vw" // Logic: Always 1/4 of the screen width
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Badge variant="outline" className="bg-forest/5 text-forest">
              {welcome.badge}
            </Badge>
            <h3 className="font-semibold text-lg">{welcome.heading}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {welcome.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={welcomeDialogOpen} onOpenChange={setWelcomeDialogOpen}>
        <DialogContent className="max-w-3xl h-[100dvh] sm:h-[90dvh] overflow-hidden p-0">
          <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>Edit Welcome Section</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="mt-4 mb-10">
                  <Label>Badge</Label>
                  <Input
                    value={welcome.badge}
                    onChange={(e) =>
                      setWelcome({ ...welcome, badge: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Heading</Label>
                  <Input
                    value={welcome.heading}
                    onChange={(e) =>
                      setWelcome({ ...welcome, heading: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={welcome.description}
                    onChange={(e) =>
                      setWelcome({ ...welcome, description: e.target.value })
                    }
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Images (4 images)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {tempWelcomePreviews.map((p, i) => (
                      /* DIALOG EDIT PREVIEWS (2 Columns) */
                      /* Added 'w-full aspect-[3/4]' to the parent div */
                      <div key={i} className="relative w-full aspect-[3/4]">
                        {p ? (
                          <>
                            <Image
                              src={p}
                              alt={`welcome-${i}`}
                              fill
                              className="object-cover rounded-lg"
                              sizes="(max-width: 768px) 50vw, 384px" // Logic: Dialog is max 768px. 2 cols = ~384px per image.
                            />
                            <button
                              onClick={() => {
                                const np = [...tempWelcomePreviews];
                                np[i] = "";
                                setTempWelcomePreviews(np);
                                const nf = [...welcomeFiles];
                                nf[i] = null;
                                setWelcomeFiles(nf);
                              }}
                              className="absolute z-10 top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <label className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-forest transition-colors w-full h-full flex flex-col items-center justify-center">
                            <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-xs">Upload #{i + 1}</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => onWelcomeImageSelect(i, e)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setWelcomeDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={saveWelcome}
                    disabled={savingWelcome}
                  >
                    {savingWelcome ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Welcome"
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

export default WelcomeSection;
