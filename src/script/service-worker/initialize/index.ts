import { browser as crossBrowser } from 'wxt/browser';

export function initExtensionView() {
  crossBrowser.runtime.onInstalled.addListener((detail) => {
    if (detail.reason === 'install') {
      if (import.meta.env.FIREFOX) {
        browser.sidebarAction.open();
      } else {
        crossBrowser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
      }
    }
  });
}
