"use client";

import {
  init,
  miniApp,
  viewport,
} from "@tma.js/sdk";

export function initTelegram() {
  try {
    init();

    if (miniApp.mount.isAvailable()) {
      miniApp.mount();
    }

    if (viewport.mount.isAvailable()) {
      viewport.mount();
    }

    return true;
  } catch (e) {
    console.error("Telegram init failed:", e);
    return false;
  }
}

export { miniApp, viewport };