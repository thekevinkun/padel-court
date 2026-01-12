"use client";

import { useState, useEffect } from "react";
import { History, Loader2, Clock, User, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Version, VersionHistoryDialogProps } from "@/types";
import { supabase } from "@/lib/supabase/client";

const VersionHistoryDialog = ({
  sectionType,
  currentVersion,
  onRestore,
}: VersionHistoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  // Fetch versions when dialog opens
  useEffect(() => {
    if (open) {
      fetchVersions();
    }
  }, [open]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      // Get section ID first
      const { data: section, error: sectionError } = await supabase
        .from("content_sections")
        .select("id")
        .eq("section_type", sectionType)
        .single();

      if (sectionError) throw sectionError;

      // Get all versions for this section
      const { data, error } = await supabase
        .from("content_versions")
        .select("*")
        .eq("section_id", section.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVersions(data || []);
    } catch (error) {
      console.error("Error fetching versions:", error);
      alert("Failed to load version history");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version: Version) => {
    if (
      !confirm(
        `Restore to version ${version.version}? This will create a new version with the old content.`
      )
    ) {
      return;
    }

    setRestoring(version.id);
    try {
      // Get section ID
      const { data: section, error: sectionError } = await supabase
        .from("content_sections")
        .select("id, version")
        .eq("section_type", sectionType)
        .single();

      if (sectionError) throw sectionError;

      const newVersion = section.version + 1;

      // Create new version snapshot
      const { data: userData } = await supabase.auth.getUser();

      const { error: versionError } = await supabase
        .from("content_versions")
        .insert({
          section_id: section.id,
          version: section.version,
          content: version.content,
          changed_by: userData?.user?.id || null,
          change_description: `Restored from version ${version.version}`,
        });

      if (versionError) throw versionError;

      // Update section with restored content
      const { error: updateError } = await supabase
        .from("content_sections")
        .update({
          content: version.content,
          version: newVersion,
          updated_at: new Date().toISOString(),
        })
        .eq("section_type", sectionType);

      if (updateError) throw updateError;

      alert(`✅ Restored to version ${version.version}`);
      setOpen(false);

      // Call optional restore callback
      if (onRestore) {
        onRestore(version);
      }

      // Reload page to show restored content
      window.location.reload();
    } catch (error) {
      console.error("Error restoring version:", error);
      alert("Failed to restore version");
    } finally {
      setRestoring(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getSectionName = (type: string) => {
    const names: Record<string, string> = {
      hero: "Hero Section",
      welcome: "Welcome Section",
      features: "Features Grid",
      pricing: "Pricing Section",
    };
    return names[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="w-4 h-4" />
          Version History
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {getSectionName(sectionType)} - Version History
          </DialogTitle>
          <DialogDescription>
            Current version: <Badge variant="outline">v{currentVersion}</Badge>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-forest" />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No version history yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Versions will appear here after you save changes
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`border rounded-lg p-4 ${
                    version.version === currentVersion
                      ? "border-forest bg-forest/5"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          version.version === currentVersion
                            ? "default"
                            : "outline"
                        }
                        className="text-sm"
                      >
                        v{version.version}
                      </Badge>
                      {version.version === currentVersion && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    {version.version !== currentVersion && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestore(version)}
                        disabled={restoring !== null}
                        className="gap-2"
                      >
                        {restoring === version.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Restoring...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3 h-3" />
                            Restore
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {version.change_description && (
                      <p className="text-sm font-medium">
                        {version.change_description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(version.created_at)}
                      </div>
                      {version.changed_by && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {version.changed_by.substring(0, 8)}...
                        </div>
                      )}
                    </div>

                    {/* Preview of content changes */}
                    <details className="mt-3">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        View content snapshot
                      </summary>
                      <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(version.content, null, 2)}
                      </pre>
                    </details>
                  </div>

                  {index < versions.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VersionHistoryDialog;
