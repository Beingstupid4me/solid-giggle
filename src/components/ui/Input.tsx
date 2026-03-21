"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
}

export function Input({
  label,
  icon: Icon,
  className,
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        )}
        <input
          className={cn(
            "w-full rounded-xl border border-slate-200 bg-white/50 py-3 text-sm",
            "focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-white",
            "transition-all outline-none",
            "placeholder:text-gray-400",
            Icon ? "pl-12 pr-4" : "px-4",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: LucideIcon;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  icon: Icon,
  options,
  className,
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        )}
        <select
          className={cn(
            "w-full rounded-xl border border-slate-200 bg-white/50 py-3 text-sm appearance-none cursor-pointer",
            "focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-white",
            "transition-all outline-none",
            Icon ? "pl-12 pr-10" : "px-4 pr-10",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg 
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
