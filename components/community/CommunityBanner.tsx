import { Send } from "lucide-react";

export default function CommunityBanner() {
  return (
    <section
      className="
        overflow-hidden
        rounded-3xl
        border
        border-cyan-900/40
        bg-gradient-to-br
        from-cyan-700
        via-cyan-600
        to-sky-700
        p-6
      "
    >
      <h2 className="text-2xl font-bold text-white">
        Join the IME Community
      </h2>

      <p className="mt-2 max-w-[240px] text-sm leading-5 text-cyan-100/80">
        Connect with fellow creators, ask questions,
        share your work and stay updated with new lessons.
      </p>

      <button
        className="
          mt-4
          inline-flex
          items-center
          gap-2
          rounded-xl
          bg-white
          px-5
          py-3
          font-semibold
          text-cyan-700
          transition
          hover:bg-cyan-50
        "
      >
        <Send className="h-5 w-5" />

        Join Telegram
      </button>
    </section>
  );
}