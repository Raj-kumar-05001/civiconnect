import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-paper font-sans overflow-hidden">
      <Navbar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-6 md:p-8 max-w-[1100px] w-full box-border flex-1">{children}</div>
        <Footer />
      </div>
    </div>
  );
}