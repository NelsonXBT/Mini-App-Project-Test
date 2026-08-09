/**
 * Where a lesson's still frame comes from.
 *
 * Bunny Stream renders a thumbnail for every video it encodes and serves it
 * from the same directory as the playlist — `<guid>/thumbnail.jpg` next to
 * `<guid>/playlist.m3u8`. Lessons already store that playlist URL in
 * `videoId`, so the poster is derivable from data we hold and needs no
 * schema column, no upload, and no admin step: every lesson that plays today
 * has one already.
 *
 * The alternative — pulling a frame out of the video in the browser — cannot
 * work here. It requires fetching and decoding the video first, so the image
 * would arrive after the load it exists to cover.
 *
 * Returning null rather than a fallback image is deliberate: the player keeps
 * its black background, which is what it showed before this existed. A broken
 * <img> would be worse than none.
 */
export function bunnyPosterUrl(playlistUrl: string): string | null {
  const trimmed = playlistUrl.trim();

  if (!trimmed) return null;

  /*
   * Parsed rather than string-replaced. Bunny URLs can carry a token query
   * (`?token=…&expires=…`) when a zone uses signed URLs, and `.replace()` on
   * the raw string would leave that query stranded after the new filename —
   * or, worse, match a "playlist.m3u8" sitting inside the query itself.
   */
  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    // A bare YouTube ID or a malformed entry. Not ours to poster.
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const segments = url.pathname.split("/");
  const filename = segments[segments.length - 1];

  // Only swap a real playlist filename. Anything else is a URL shape we do
  // not recognise, and guessing a sibling path on an unknown host would just
  // produce 404s behind the player.
  if (!filename.endsWith(".m3u8")) return null;

  segments[segments.length - 1] = "thumbnail.jpg";
  url.pathname = segments.join("/");

  return url.toString();
}

/**
 * The poster for a lesson, in precedence order.
 *
 * Split from the Bunny helper so that adding an admin-set `thumbnail` column
 * later is a one-line change here — pass it in, prefer it, fall through to
 * the derived frame when it is empty. Callers do not change.
 */
export function lessonPosterUrl(lesson: {
  provider: string;
  videoId: string;
  thumbnail?: string | null;
}): string | null {
  const custom = lesson.thumbnail?.trim();

  if (custom) return custom;

  if (lesson.provider === "bunny") {
    return bunnyPosterUrl(lesson.videoId);
  }

  return null;
}
