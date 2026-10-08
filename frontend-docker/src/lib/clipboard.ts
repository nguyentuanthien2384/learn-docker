export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Clipboard API can be unavailable (insecure context, permissions) - silently ignore,
    // the UI simply won't show the "copied" confirmation.
  }
}
