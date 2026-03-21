"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "solid";
}

export function GlassCard({ 
  children, 
  className, 
  variant = "default",
  ...props 
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-8 shadow-2xl",
        variant === "default" && "glass-panel",
        variant === "solid" && "bg-white border border-slate-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
