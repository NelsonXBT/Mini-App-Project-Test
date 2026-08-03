export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative flex items-center justify-center">
        {/* Rotating Ring */}
        <div className="absolute h-24 w-24 animate-spin rounded-full border-2 border-transparent border-t-cyan-500 border-r-cyan-500" />

        {/* IME Logo */}
        <h1 className="text-4xl font-bold tracking-wider text-cyan-500">
          IME
        </h1>
      </div>
    </div>
  );
}