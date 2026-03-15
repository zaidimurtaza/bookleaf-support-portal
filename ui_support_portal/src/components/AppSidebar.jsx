import React from "react";
import { Leaf } from "lucide-react";
import SidebarContent from "@/components/SidebarContent";

export default function AppSidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-card border-r border-border flex flex-col z-30 hidden md:flex">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-border shrink-0">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Leaf className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">BookLeaf</span>
      </div>
      <SidebarContent />
    </aside>
  );
}
