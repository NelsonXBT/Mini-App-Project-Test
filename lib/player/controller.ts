let saveCallback: (() => Promise<void>) | null = null;

export function registerPlayer(
  callback: () => Promise<void>
) {
  saveCallback = callback;
}

export async function savePlayerProgress() {
  if (saveCallback) {
    await saveCallback();
  }
}