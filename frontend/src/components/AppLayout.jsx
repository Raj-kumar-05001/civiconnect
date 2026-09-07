import React from "react";
import Navbar from "./Navbar";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-paper font-sans">
      <Navbar />
      <div className="flex-1 p-6 md:p-8 max-w-[1100px] box-border">{children}</div>
    </div>
  );
}
