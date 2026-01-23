import { browser } from 'wxt/browser';

export function detectIsPopup(): boolean {
  const ext = browser.extension;

  if (!ext?.getViews) return false;

  try {
    const views = ext.getViews({ type: 'popup' });

    return Array.isArray(views) && views.includes(window);
  } catch {
    return false;
  }
}
