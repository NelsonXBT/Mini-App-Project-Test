import Link from "next/link";
import { ArrowDown } from "lucide-react";
import {
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaTiktok,
} from "react-icons/fa6";

export default function FollowNelson() {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Connect with Nelson Edeh
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            
          </p>
        </div>

        <ArrowDown className="h-5 w-5 text-cyan-400" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href="#"
          className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-3 transition hover:bg-zinc-700"
        >
          <FaYoutube className="h-5 w-5 text-red-500" />
          <span>YouTube</span>
        </Link>

        <Link
          href="#"
          className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-3 transition hover:bg-zinc-700"
        >
          <FaInstagram className="h-5 w-5 text-pink-500" />
          <span>Instagram</span>
        </Link>

        <Link
          href="#"
          className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-3 transition hover:bg-zinc-700"
        >
          <FaFacebook className="h-5 w-5 text-blue-500" />
          <span>Facebook</span>
        </Link>

        <Link
          href="#"
          className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-3 transition hover:bg-zinc-700"
        >
          <FaTiktok className="h-5 w-5 text-white" />
          <span>TikTok</span>
        </Link>
      </div>
    </section>
  );
}