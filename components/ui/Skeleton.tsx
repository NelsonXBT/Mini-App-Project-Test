type SkeletonProps = {
  className?: string;
};

/*
 * A neutral placeholder block for loading.tsx files.
 *
 * Sized entirely by the caller so each skeleton can mirror the real component
 * it stands in for — a placeholder that occupies different space than the
 * content replacing it produces a layout jump on load, which reads as slower
 * than showing nothing at all.
 */
export default function Skeleton({
  className = "",
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`
        animate-pulse
        rounded-[var(--radius-control)]
        bg-[var(--surface-secondary)]
        ${className}
      `}
    />
  );
}
