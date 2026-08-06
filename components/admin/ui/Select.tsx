"use client";

import { ChevronDown } from "lucide-react";

import { controlClasses } from "./FormField";

type Option = {
  value: string;
  label: string;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  id?: string;
  placeholder?: string;
  disabled?: boolean;
};

export default function Select({
  value,
  onChange,
  options,
  id,
  placeholder,
  disabled = false,
}: SelectProps) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${controlClasses} h-11 appearance-none pr-9`}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        className="
          pointer-events-none
          absolute
          right-3
          top-1/2
          h-4
          w-4
          -translate-y-1/2
          text-[var(--text-subtle)]
        "
        strokeWidth={1.9}
      />
    </div>
  );
}
