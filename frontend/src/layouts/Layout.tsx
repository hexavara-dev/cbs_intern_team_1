"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-background flex min-h-screen">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex min-w-0 flex-1 flex-col md:ml-[280px] lg:ml-[310px]">
        {/* Navbar */}
        <div className="sticky top-0 z-40 border-b bg-white">
          <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <main className="p-4 md:p-6 lg:p-12">{children}</main>
        </div>
      </div>
    </div>
  );
}
