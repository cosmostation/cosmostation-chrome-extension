import { extension } from '../browser';

export function isInTabView() {
  return extension.extension.getViews({ type: 'tab' }).length > 0;
}

export function getCurrentExtensionTabInfo(): Promise<chrome.tabs.Tab | browser.tabs.Tab | undefined> {
  return extension.tabs.getCurrent();
}

export async function getActiveTabInfo() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await extension.tabs.query(queryOptions);

  const origin = tab?.url ? new URL(tab.url).origin : undefined;
  return { ...tab, origin };
}
