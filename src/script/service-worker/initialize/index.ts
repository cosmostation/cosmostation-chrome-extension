import { extension } from '@/utils/browser';

export function initExtensionView() {
  extension.runtime.onInstalled.addListener((detail) => {
    if (detail.reason === 'install') {
      if (__APP_BROWSER__ === 'chrome') {
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
      } else {
        browser.sidebarAction.open();
      }
    }
  });
}
