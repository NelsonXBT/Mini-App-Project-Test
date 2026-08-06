"use client";

/**
 * Fullscreen state shared across player mounts.
 *
 * CourseLearning remounts VideoPlayer via key={selectedLesson.id} on every
 * lesson change, so Daluplayer's own React state is destroyed each time. This
 * module-level flag is what lets fullscreen survive an auto-advance: the new
 * mount seeds itself from here instead of defaulting back to normal mode.
 *
 * Read synchronously at mount and on demand — no subscription needed, so there
 * is deliberately no listener machinery here.
 */

let isFullscreen: boolean = false;

export function setFullscreen(
  value: boolean
) {
  isFullscreen = value;
}

export function getFullscreen() {
  return isFullscreen;
}
