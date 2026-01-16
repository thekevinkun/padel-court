"use client";

import { Home, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CMSTabsProps {
  homepageContent: React.ReactNode;
  pagesContent: React.ReactNode;
}

const CMSTabs = ({ homepageContent, pagesContent }: CMSTabsProps) => {
  return (
    <Tabs defaultValue="homepage" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
        <TabsTrigger value="homepage" className="gap-2">
          <Home className="w-4 h-4" />
          Homepage
        </TabsTrigger>
        <TabsTrigger value="pages" className="gap-2">
          <FileText className="w-4 h-4" />
          Pages
        </TabsTrigger>
      </TabsList>

      <TabsContent value="homepage" className="space-y-6">
        {homepageContent}
      </TabsContent>

      <TabsContent value="pages" className="space-y-6">
        {pagesContent}
      </TabsContent>
    </Tabs>
  );
};

export default CMSTabs;
