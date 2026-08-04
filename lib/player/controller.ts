let saveCallback: (() => Promise<void>) | null = null;

export function registerPlayer(
  callback: () => Promise<void>
) {
  console.log("✅ registerPlayer() called");

  saveCallback = callback;
}

export async function savePlayerProgress() {
  console.log("➡️ savePlayerProgress() called");

  if (!saveCallback) {
    console.log("❌ No player registered");
    return;
  }

  console.log("✅ Calling registered player");

  await saveCallback();
}