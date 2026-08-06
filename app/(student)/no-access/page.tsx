import { Button } from "@/components/ui";

export default function NoAccessPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center text-center">
      <h1 className="text-[1.375rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
        You just took a big step
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
        It looks like you don&apos;t have access to any courses or packs yet.
      </p>

      <Button href="/courses" className="mt-7">
        Browse Courses
      </Button>
    </main>
  );
}
