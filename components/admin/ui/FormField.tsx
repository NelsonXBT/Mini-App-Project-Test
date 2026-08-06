import { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export default function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="block text-[13px] font-medium tracking-tight text-[var(--text)]"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-[var(--danger)]">*</span>
        )}
      </label>

      {children}

      {error ? (
        <p className="text-[12px] text-[var(--danger)]">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-[var(--text-subtle)]">{hint}</p>
      ) : null}
    </div>
  );
}

/*
 * Shared control styling. Exported so inputs, textareas and selects across the
 * admin all resolve to the same height, radius, border and focus treatment.
 */
export const controlClasses = `
  w-full
  rounded-[var(--radius-control)]
  border
  border-[var(--border)]
  bg-[var(--card)]
  px-3
  text-[14px]
  text-[var(--text)]
  outline-none
  transition-all
  duration-200
  ease-out
  placeholder:text-[var(--text-subtle)]
  focus:border-[var(--primary)]
  focus:ring-2
  focus:ring-[var(--primary-ring)]
  disabled:opacity-50
`;

export const inputClasses = `${controlClasses} h-11`;

export const textareaClasses = `${controlClasses} py-2.5 leading-relaxed resize-y min-h-[96px]`;
