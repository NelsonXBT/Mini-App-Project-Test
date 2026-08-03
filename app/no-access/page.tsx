export default function NoAccessPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">

      <h1 className="text-3xl font-bold text-white">
        No Access
      </h1>

      <p className="mt-4 text-zinc-400">
        You don't currently have access to any IME Creative Lab products.
      </p>

      <a
        href="https://YOUR-NESTUGE-LINK"
        className="mt-8 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black"
      >
        Browse Courses
      </a>

    </main>
  );
}