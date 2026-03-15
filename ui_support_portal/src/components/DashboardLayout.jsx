import React, { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import SidebarContent from "@/components/SidebarContent";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Leaf } from "lucide-react";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center px-4 z-40">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <button className="p-2 -ml-2 rounded-lg hover:bg-secondary transition-default" aria-label="Open menu">
              <Menu className="w-6 h-6 text-foreground" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <div className="h-16 flex items-center gap-2 px-5 border-b border-border shrink-0">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">BookLeaf</span>
            </div>
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex-1 flex justify-center items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">BookLeaf</span>
        </div>
        <div className="w-10" />
      </header>
      <main className="md:ml-60 min-h-screen pt-14 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
