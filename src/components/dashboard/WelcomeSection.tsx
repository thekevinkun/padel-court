"use client";

import { useState } from "react";
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

import { WelcomeSectionCMS } from "@/types";

const WelcomeSection = ({
  welcome,
  setWelcome,
  welcomeDialogOpen,
  setWelcomeDialogOpen,
  welcomePreviews,
  setWelcomePreviews,
  welcomeFiles,
  setWelcomeFiles,
  onWelcomeImageSelect,
  saveWelcome,
  savingWelcome,
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
            <Button
              onClick={() => setWelcomeDialogOpen(true)}
              className="gap-2"
            >
              <Edit className="w-4 h-4" /> Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {welcomePreviews.map((p, idx) => (
              <div
                key={idx}
                className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden"
              >
                <img
                  src={p}
                  alt={`welcome-${idx}`}
                  className="w-full h-full object-cover"
                />
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Welcome Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
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
                {welcomePreviews.map((p, i) => (
                  <div key={i} className="relative">
                    {p ? (
                      <>
                        <img
                          src={p}
                          alt={`welcome-${i}`}
                          className="w-full aspect-[3/4] object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            const np = [...welcomePreviews];
                            np[i] = "";
                            setWelcomePreviews(np);
                            const nf = [...welcomeFiles];
                            nf[i] = null;
                            setWelcomeFiles(nf);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <label className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-forest transition-colors aspect-[3/4] flex flex-col items-center justify-center">
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
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WelcomeSection;
