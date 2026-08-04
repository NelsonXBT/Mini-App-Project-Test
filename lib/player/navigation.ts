export async function saveAndNavigate(
  save: () => Promise<void>,
  navigate: () => void
) {
  try {
    await save();
  } catch (error) {
    console.error("Failed to save progress:", error);
  }

  navigate();
}