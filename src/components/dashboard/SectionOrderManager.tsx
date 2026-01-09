"use client";

import { useState, useEffect } from "react";
import { GripVertical, Eye, EyeOff, Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import { supabase } from "@/lib/supabase/client";

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

type ContentSection = {
  id: string;
  section_type: string;
  section_order: number;
  is_active: boolean;
  version: number;
};

const SortableItem = ({
  section,
  onToggleActive,
}: {
  section: ContentSection;
  onToggleActive: (section: ContentSection) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Get section display info
  const getSectionInfo = (type: string) => {
    const info = {
      hero: { name: "Hero", emoji: "🎯", color: "bg-blue-100 text-blue-800" },
      welcome: {
        name: "Welcome",
        emoji: "👋",
        color: "bg-green-100 text-green-800",
      },
      features: {
        name: "Features",
        emoji: "✨",
        color: "bg-purple-100 text-purple-800",
      },
      pricing: {
        name: "Pricing",
        emoji: "💰",
        color: "bg-orange-100 text-orange-800",
      },
    };
    return (
      info[type as keyof typeof info] || {
        name: type,
        emoji: "📄",
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  const sectionInfo = getSectionInfo(section.section_type);

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`flex items-center gap-3 p-3 bg-card border rounded-lg ${
          isDragging ? "shadow-lg" : ""
        } ${!section.is_active ? "opacity-60" : ""}`}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded transition-colors"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Section Info */}
        <div className="flex-1 flex items-center gap-3">
          <Badge className={`${sectionInfo.color} text-xs`}>
            {sectionInfo.emoji} {sectionInfo.name}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Order: {section.section_order}
          </span>
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {section.is_active ? "Visible" : "Hidden"}
          </span>
          {section.is_active ? (
            <Eye className="w-4 h-4 text-muted-foreground" />
          ) : (
            <EyeOff className="w-4 h-4 text-muted-foreground" />
          )}
          <Switch
            checked={section.is_active}
            onCheckedChange={() => onToggleActive(section)}
          />
        </div>
      </div>
    </div>
  );
};

const SectionOrderManager = () => {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch sections from database
  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from("content_sections")
        .select("id, section_type, section_order, is_active, version")
        .order("section_order", { ascending: true });

      if (error) throw error;

      setSections(data || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setSections((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(items, oldIndex, newIndex);

      // Update section_order for all items
      const updatedOrder = newOrder.map((item, index) => ({
        ...item,
        section_order: index + 1,
      }));

      // Save to database
      saveOrder(updatedOrder);

      return updatedOrder;
    });
  };

  // Save new order to database
  const saveOrder = async (orderedSections: ContentSection[]) => {
    setSaving(true);
    try {
      // Update each section's order
      const updates = orderedSections.map((section) =>
        supabase
          .from("content_sections")
          .update({ section_order: section.section_order })
          .eq("id", section.id)
      );

      await Promise.all(updates);

      console.log("✅ Section order saved");
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to save order");
      fetchSections();
    } finally {
      setSaving(false);
    }
  };

  // Toggle section visibility
  const handleToggleActive = async (section: ContentSection) => {
    try {
      const { error } = await supabase
        .from("content_sections")
        .update({ is_active: !section.is_active })
        .eq("id", section.id);

      if (error) throw error;

      // Update local state
      setSections((prev) =>
        prev.map((s) =>
          s.id === section.id ? { ...s, is_active: !s.is_active } : s
        )
      );
    } catch (error) {
      console.error("Error toggling visibility:", error);
      alert("Failed to update visibility");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-forest" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Section Manager
              {saving && (
                <Badge variant="outline" className="gap-1 font-normal">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Drag to reorder sections or toggle visibility
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Tip:</strong> Drag sections to change their order on the
              website. Toggle switches to show/hide sections.
            </AlertDescription>
          </Alert>

          {/* Sortable List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sections.map((section) => (
                  <SortableItem
                    key={section.id}
                    section={section}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {sections.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No sections found in database
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default SectionOrderManager;