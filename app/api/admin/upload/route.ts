import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

import { getCurrentAdmin } from "@/lib/admin/auth";

/**
 * Image upload for broadcast messages.
 *
 * A route handler rather than a server action because server actions cap the
 * request body at 1MB by default, which is below any useful image. This
 * streams the file straight to Vercel Blob and returns the public URL.
 *
 * Admin-only. Checked here with the same getCurrentAdmin() the protected
 * layout uses, rather than relying on the proxy — a route handler is directly
 * addressable, and the proxy can only see that a cookie exists.
 */

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;

/*
 * Telegram accepts JPEG, PNG, GIF and WebP for sendPhoto. Anything else would
 * be rejected at send time with an unhelpful error, so it is refused here.
 */
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/gif", "gif"],
  ["image/webp", "webp"],
]);

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Image uploads are not configured on this deployment." },
      { status: 503 }
    );
  }

  let file: File | null = null;

  try {
    const formData = await request.formData();
    const candidate = formData.get("file");

    if (candidate instanceof File) file = candidate;
  } catch {
    return NextResponse.json(
      { error: "Could not read the upload." },
      { status: 400 }
    );
  }

  if (!file) {
    return NextResponse.json({ error: "No file was sent." }, { status: 400 });
  }

  const extension = ALLOWED.get(file.type);

  if (!extension) {
    return NextResponse.json(
      { error: "Use a JPEG, PNG, GIF or WebP image." },
      { status: 415 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Images must be 5MB or smaller." },
      { status: 413 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "That file is empty." }, { status: 400 });
  }

  try {
    /*
     * addRandomSuffix keeps two uploads of the same filename from overwriting
     * each other — a broadcast's image has to stay available for the history
     * view long after it was sent.
     */
    const blob = await put(`broadcasts/${Date.now()}.${extension}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    return NextResponse.json({
      url: blob.url,
      key: blob.pathname,
      mimeType: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("Broadcast image upload failed:", error);

    return NextResponse.json(
      { error: "The upload failed. Try again." },
      { status: 502 }
    );
  }
}
