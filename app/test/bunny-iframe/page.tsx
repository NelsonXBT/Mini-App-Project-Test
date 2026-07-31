"use client";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        version: string;
        platform: string;
        isFullscreen?: boolean;
        requestFullscreen?: () => void;
        exitFullscreen?: () => void;
      };
    };
  }
}

export default function BunnyHlsTest() {
  const tg = window?.Telegram?.WebApp;

  const enterFullscreen = () => {
    if (!tg) {
      alert("Telegram WebApp not detected.");
      return;
    }

    if (!tg.requestFullscreen) {
      alert(
        `requestFullscreen() is NOT supported.\nTelegram Version: ${tg.version}`
      );
      return;
    }

    tg.requestFullscreen();
  };

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">
        Telegram Fullscreen Test
      </h1>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
        <p>
          <strong>Platform:</strong>{" "}
          {tg?.platform ?? "Not Telegram"}
        </p>

        <p>
          <strong>Telegram Version:</strong>{" "}
          {tg?.version ?? "Unknown"}
        </p>

        <p>
          <strong>requestFullscreen():</strong>{" "}
          {tg?.requestFullscreen ? "✅ Supported" : "❌ Not Supported"}
        </p>

        <p>
          <strong>Current Fullscreen:</strong>{" "}
          {tg?.isFullscreen ? "✅ Yes" : "❌ No"}
        </p>
      </div>

      <button
        onClick={enterFullscreen}
        className="w-full rounded-xl bg-cyan-500 py-4 text-lg font-bold text-black transition hover:bg-cyan-400"
      >
        Enter Telegram Fullscreen
      </button>

      <div className="overflow-hidden rounded-xl bg-black">
        <video
          src="https://vz-4b93e9b4-6e7.b-cdn.net/b46ce3e3-a752-42eb-af1c-a14800d344d9/playlist.m3u8"
          autoPlay
          muted
          playsInline
          controls={false}
          className="w-full"
        />
      </div>

      <p className="text-sm text-zinc-400">
        If the button expands the Mini App, Telegram's Fullscreen API is working.
        If nothing happens, we'll know the issue is at the Telegram API level rather
        than with Bunny or HTML5 video.
      </p>
    </main>
  );
}