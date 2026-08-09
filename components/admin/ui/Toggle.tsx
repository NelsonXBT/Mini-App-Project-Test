"use client";

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
};

export default function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      {(label || description) && (
        <div className="min-w-0">
          {label && (
            <p className="text-[14px] font-medium tracking-tight text-[var(--text)]">
              {label}
            </p>
          )}

          {description && (
            <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
              {description}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative
          inline-flex
          h-6
          w-10
          shrink-0
          items-center
          rounded-[var(--radius-pill)]
          transition-colors
          duration-200
          ease-out
          disabled:opacity-50
          ${
            checked
              ? "bg-[var(--primary)]"
              : "bg-[var(--border-strong)]"
          }
        `}
      >
        <span
          className={`
            inline-block
            h-4.5
            w-4.5
            rounded-[var(--radius-pill)]
            bg-white
            shadow-sm
            transition-transform
            duration-200
            ease-out
            ${checked ? "translate-x-[19px]" : "translate-x-[3px]"}
          `}
        />
      </button>
    </div>
  );
}
