import { type Browser } from 'wxt/browser';
import { browser } from 'wxt/browser';

export function isInTabView() {
  return browser.extension.getViews({ type: 'tab' }).length > 0;
}

export function getCurrentExtensionTabInfo(): Promise<Browser.tabs.Tab | undefined> {
  return browser.tabs.getCurrent();
}

export async function getActiveTabInfo() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await browser.tabs.query(queryOptions);

  const origin = tab?.url ? new URL(tab.url).origin : undefined;
  return { ...tab, origin };
}
