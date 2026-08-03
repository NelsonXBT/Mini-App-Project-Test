import Link from "next/link";



export default function NoAccessPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">

      <h1 className="text-1xl font-bold text-white">
        You Just Took a Big Step
      </h1>

      <p className="mt-4 text-zinc-400">
        It looks like you haven't enrolled in any courses or purchased any packs yet.
      </p>

      <Link
        href="/courses"
        className="mt-8 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black"
      >
        Browse Courses
      </Link>

    </main>
  );
}